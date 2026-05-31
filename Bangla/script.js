'use strict';

/* ── CONFIG ── */
var WHATSAPP_LINK = "https://whatsapp.com/channel/0029VaeylYYBPzjVNomWuZ0T";
var VIEW_API_BASE = "https://sayan-prime.pages.dev/api";
var DATA_SOURCES  = [
  "https://sayan-json-4.pages.dev/loura.json",
  "https://allrounderlive.in/id.json"
];
var IPL_DATA_URL  = "https://sayan-json-4.pages.dev/api/ipl-data.json";
var FALLBACK_COUNT = 770;

/* ── PREFETCH — fires the moment script tag is parsed ── */
var _dataPromise = null;
function prefetchData() {
  if (_dataPromise) return _dataPromise;
  _dataPromise = Promise.all(
    DATA_SOURCES.map(function(url) {
      return fetch(url, { cache: 'no-store' })
        .then(function(r) { return r.ok ? r.json() : null; })
        .catch(function() { return null; });
    })
  );
  return _dataPromise;
}
prefetchData(); /* immediate — before DOMContentLoaded */

/* ── VISITOR COUNT FORMATTER ──
   < 5000  → show exact number  (e.g. 4382)
   ≥ 5000  → show xK format    (e.g. 6.58K)             */
function formatCount(n) {
  if (isNaN(n) || n <= 0) return null;
  if (n < 5000) return String(n);
  return (n / 1000).toFixed(2).replace(/\.?0+$/, '') + 'K';
}

function setCount(n) {
  var el = document.getElementById('footerCount');
  if (!el) return false;
  var fmt = formatCount(n);
  if (!fmt) return false;
  el.textContent = fmt;
  return true;
}

/* ── SUPERCOUNTERS EXTRACTION ──
   Tries every known pattern SuperCounters might output.   */
var _scDone = false;
var _scTimer = null;
var _scObs   = null;

function tryExtractSc() {
  if (_scDone) return true;
  var c = document.getElementById('sc-hidden');
  if (!c) return false;

  /* 1. <img alt="N"> */
  var imgs = c.querySelectorAll('img');
  for (var i = 0; i < imgs.length; i++) {
    var n = parseInt((imgs[i].getAttribute('alt') || '').trim(), 10);
    if (!isNaN(n) && n > 0 && n < 2000000) { _scDone = true; return setCount(n); }

    /* 2. src ?count=N / ?c=N / ?v=N / ?online=N */
    var m = (imgs[i].getAttribute('src') || '').match(/[?&](?:count|c|n|v|online)=(\d+)/i);
    if (m) { n = parseInt(m[1], 10); if (!isNaN(n) && n > 0) { _scDone = true; return setCount(n); } }
  }

  /* 3. Text nodes: span / b / strong / td / div / p */
  var nodes = c.querySelectorAll('span,b,strong,td,div,p');
  for (var j = 0; j < nodes.length; j++) {
    var raw = (nodes[j].textContent || '').trim();
    if (/^\d+$/.test(raw)) {
      var v = parseInt(raw, 10);
      if (v > 0 && v < 2000000) { _scDone = true; return setCount(v); }
    }
  }
  return false;
}

function watchSc() {
  /* MutationObserver — triggers as soon as SC widget writes to DOM */
  if (typeof MutationObserver === 'undefined') return;
  var c = document.getElementById('sc-hidden');
  if (!c) return;
  _scObs = new MutationObserver(function() {
    if (tryExtractSc()) { _scObs.disconnect(); clearInterval(_scTimer); }
  });
  _scObs.observe(c, { childList:true, subtree:true, attributes:true, characterData:true });
}

function startScPolling() {
  var attempts = 0;
  _scTimer = setInterval(function() {
    if (tryExtractSc()) {
      clearInterval(_scTimer);
      if (_scObs) _scObs.disconnect();
      return;
    }
    if (++attempts >= 80) { /* ~36 s */
      clearInterval(_scTimer);
      if (_scObs) _scObs.disconnect();
      /* Final fallback */
      if (!_scDone) setCount(FALLBACK_COUNT);
    }
  }, 450);
}

/* ── IPL HIT COUNTER (fire-and-forget page view) ── */
function initVisitorCounter() {
  fetch(IPL_DATA_URL, { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var s = d.sections && d.sections.find(function(x) { return x.slot === 'NEW'; });
      if (!s) return;
      fetch(VIEW_API_BASE + '/hit?key=' + encodeURIComponent('IPL-2026_' + s.id))
        .catch(function() {});
    }).catch(function() {});
}

/* ── POPUP ── */
function closePopup() {
  var el = document.getElementById('popup');
  if (el) el.style.display = 'none';
}
function joinNow()       { closePopup(); window.open(WHATSAPP_LINK, '_blank', 'noopener,noreferrer'); }
function alreadyJoined() { closePopup(); }

function initPopupButtons() {
  var j = document.getElementById('btnJoinNow');
  var a = document.getElementById('btnAlreadyJoined');
  if (j) j.addEventListener('click', joinNow);
  if (a) a.addEventListener('click', alreadyJoined);
}

/* ── BELL RING ANIMATION ── */
function initBell() {
  var btn  = document.getElementById('bellBtn');
  var svg  = document.getElementById('bellSvg');
  if (!btn || !svg) return;

  function ring() {
    svg.classList.remove('idle','ringing');
    void svg.offsetWidth; /* reflow restart */
    svg.classList.add('ringing');
    setTimeout(function() {
      svg.classList.remove('ringing');
      svg.classList.add('idle');
    }, 700);
  }

  btn.addEventListener('click', ring);
  btn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ring(); }
  });
}

/* ── SLIDE PANEL ── */
var _notifLoaded = false;

function initSlidePanel() {
  var bellBtn      = document.getElementById('bellBtn');
  var slidePanel   = document.getElementById('slidePanel');
  var slideOverlay = document.getElementById('slideOverlay');
  var btnClose     = document.getElementById('btnCloseSlide');
  if (!bellBtn || !slidePanel) return;

  function openPanel() {
    loadNotifications();
    slidePanel.classList.add('open');
    if (slideOverlay) slideOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closePanel() {
    slidePanel.classList.remove('open');
    if (slideOverlay) slideOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  bellBtn.addEventListener('click', openPanel);
  if (btnClose)     btnClose.addEventListener('click', closePanel);
  if (slideOverlay) slideOverlay.addEventListener('click', closePanel);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && slidePanel.classList.contains('open')) closePanel();
  });
}

/* ── NOTIFICATIONS ── */
function escH(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildNotifCard(item) {
  var msg  = escH(item.message || item.text || item.title || '');
  var time = escH(item.time || item.date || item.timestamp || 'Just now');
  var visitBtn = item.url
    ? '<a href="'+escH(item.url)+'" target="_blank" rel="noopener noreferrer" class="visit-btn">'+
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>View</a>'
    : '';
  return '<div class="notif-card">'+
    '<div class="notif-card-top">'+
      '<span class="notif-card-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg></span>'+
      '<span class="notif-card-label">Live Update</span>'+
      '<span class="notif-card-time"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-width="2" d="M12 6v6l4 2"/></svg>'+time+'</span>'+
    '</div>'+
    '<div class="notif-message">'+msg+'</div>'+
    (visitBtn ? '<div class="notif-divider"></div><div class="notif-card-footer">'+visitBtn+'</div>' : '')+
  '</div>';
}

function loadNotifications() {
  if (_notifLoaded) return;
  _notifLoaded = true;

  var list    = document.getElementById('notificationList');
  var skel    = document.getElementById('notifSkeleton');
  if (!list) return;

  prefetchData().then(function(results) {
    var items = [];
    var fields = ['notifications','announcements','messages','updates','notice','notices','news'];
    for (var i = 0; i < results.length && !items.length; i++) {
      if (!results[i]) continue;
      for (var f = 0; f < fields.length; f++) {
        var arr = results[i][fields[f]];
        if (Array.isArray(arr) && arr.length) { items = arr; break; }
      }
    }

    if (skel && skel.parentNode) skel.parentNode.removeChild(skel);

    if (!items.length) {
      list.innerHTML =
        '<div class="no-notif">'+
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>'+
          'No announcements right now.<br>Check back soon.'+
        '</div>';
      return;
    }

    var html = '';
    items.slice(0, 6).forEach(function(item) { html += buildNotifCard(item); });
    list.innerHTML = html;

  }).catch(function() {
    if (skel && skel.parentNode) skel.parentNode.removeChild(skel);
    var list2 = document.getElementById('notificationList');
    if (list2) list2.innerHTML = '<div class="no-notif">Could not load updates.</div>';
  });
}

/* ── IFRAME SHIMMER ── */
function addShimmer() {
  var w = document.getElementById('videoWrapper');
  if (!w || document.getElementById('iframeShimmer')) return;
  if (!document.getElementById('shimmerStyle')) {
    var st = document.createElement('style');
    st.id = 'shimmerStyle';
    st.textContent = '@keyframes shimmerSlide{0%{background-position:200% 0}100%{background-position:-200% 0}}';
    document.head.appendChild(st);
  }
  var s = document.createElement('div');
  s.id = 'iframeShimmer';
  s.setAttribute('aria-hidden','true');
  s.style.cssText = 'position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,#e2e8f0 25%,#f0f4f8 50%,#e2e8f0 75%);background-size:200% 100%;animation:shimmerSlide 1.4s linear infinite;z-index:2;pointer-events:none';
  w.style.position = 'relative';
  w.insertBefore(s, w.firstChild);
}
function removeShimmer() {
  var s = document.getElementById('iframeShimmer');
  if (s && s.parentNode) s.parentNode.removeChild(s);
}

/* ── LOAD STREAM ── */
function loadStream(targetId) {
  var frame   = document.getElementById('videoFrame');
  var wrapper = document.getElementById('videoWrapper');
  var titleEl = document.getElementById('pageTitle');
  var errBox  = document.getElementById('errorBox');

  if (!targetId || !targetId.trim()) {
    if (wrapper) wrapper.style.display = 'none';
    if (errBox)  errBox.style.display  = 'block';
    if (titleEl) titleEl.innerText = 'STREAM NOT FOUND';
    setTimeout(initVisitorCounter, 600);
    return;
  }

  addShimmer();

  prefetchData().then(function(results) {
    var found = null;
    for (var i = 0; i < results.length; i++) {
      if (!results[i] || !Array.isArray(results[i].iframes)) continue;
      var m = results[i].iframes.find(function(x) { return x.id === targetId; });
      if (m) { found = m; break; }
    }

    if (found) {
      var t = setTimeout(removeShimmer, 12000);
      frame.addEventListener('load', function onLoad() {
        frame.removeEventListener('load', onLoad);
        clearTimeout(t); removeShimmer();
      });
      frame.addEventListener('error', function onErr() {
        frame.removeEventListener('error', onErr);
        clearTimeout(t); removeShimmer();
      });
      frame.src = found.iframeSrc;
      if (titleEl) titleEl.innerText = found.name;
      document.title = found.name + ' \u2013 Cricket News Point';
    } else {
      removeShimmer();
      if (wrapper) wrapper.style.display = 'none';
      if (errBox)  errBox.style.display  = 'block';
      if (titleEl) titleEl.innerText = 'STREAM NOT FOUND';
    }
    setTimeout(initVisitorCounter, 600);
  });
}

/* ── RESOLVE TARGET ID ── */
function resolveTargetId() {
  if (typeof TARGET_ID !== 'undefined' && TARGET_ID && TARGET_ID.trim()) return TARGET_ID.trim();
  var parts = window.location.pathname.replace(/^\/+|\/+$/g,'').split('/');
  var last  = parts[parts.length - 1];
  return last ? decodeURIComponent(last) : '';
}

/* ── SHARE BUTTON ── */
function initShareButton() {
  var btn = document.getElementById('shareButton');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var url   = window.location.href;
    var title = document.title;
    var text  = title + '\n\nFrom Cricket News Point\n\nWatch Live Cricket Streaming Free in HD !!';
    if (navigator.share) {
      navigator.share({ title:title, text:text, url:url }).catch(function() {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(function() { showToast('Link Copied to Clipboard !!'); })
        .catch(function() { fallbackCopy(url); });
    } else { fallbackCopy(url); }
  });
}
function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); showToast('Link Copied to Clipboard !!'); } catch(e) { alert('Link: '+text); }
  document.body.removeChild(ta);
}
function showToast(msg) {
  var old = document.getElementById('cnpToast');
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var t = document.createElement('div');
  t.id = 'cnpToast'; t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%) translateY(10px);background:rgba(30,41,59,0.92);color:#fff;padding:10px 20px;border-radius:24px;font-size:13px;font-family:inherit;font-weight:500;white-space:nowrap;z-index:99999;opacity:0;transition:opacity 0.3s,transform 0.3s;pointer-events:none;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)';
  document.body.appendChild(t);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)';
  }); });
  setTimeout(function(){
    t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)';
    setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 350);
  }, 2400);
}

/* ── FULLSCREEN LANDSCAPE LOCK ── */
function initFullscreenHandler() {
  function handleFsChange() {
    var el = document.fullscreenElement || document.webkitFullscreenElement ||
             document.mozFullScreenElement || document.msFullscreenElement;
    if (el && screen.orientation && screen.orientation.lock)
      screen.orientation.lock('landscape').catch(function() {});
  }
  document.addEventListener('fullscreenchange', handleFsChange);
  document.addEventListener('webkitfullscreenchange', handleFsChange);
  document.addEventListener('mozfullscreenchange', handleFsChange);
  document.addEventListener('MSFullscreenChange', handleFsChange);
}

/* ── ENTRY POINT ── */
document.addEventListener('DOMContentLoaded', function() {
  initPopupButtons();
  initBell();
  initSlidePanel();
  initShareButton();
  initFullscreenHandler();

  /* Start SC extraction pipeline */
  watchSc();
  startScPolling();

  /* Load stream immediately */
  loadStream(resolveTargetId());

  /* Pre-load notifications silently so panel opens instantly */
  setTimeout(loadNotifications, 500);
});
