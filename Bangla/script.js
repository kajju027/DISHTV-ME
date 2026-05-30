'use strict';

var WHATSAPP_LINK = "https://whatsapp.com/channel/0029VaeylYYBPzjVNomWuZ0T";
var VIEW_API_BASE = "https://sayan-prime.pages.dev/api";
var DATA_SOURCES  = [
  "https://sayan-json-4.pages.dev/loura.json",
  "https://allrounderlive.in/id.json"
];
var IPL_DATA_URL  = "https://sayan-json-4.pages.dev/api/ipl-data.json";

/* Cached fetch — starts immediately on script parse */
var _dataPromise = null;

function prefetchStreamData() {
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

/* Fire prefetch immediately */
prefetchStreamData();

/* ── POPUP ── */
function closePopup() {
  var el = document.getElementById('popup');
  if (el) el.style.display = 'none';
}
function joinNow()       { closePopup(); window.open(WHATSAPP_LINK, '_blank', 'noopener,noreferrer'); }
function alreadyJoined() { closePopup(); }

/* ── VISITOR COUNT (SuperCounters) ── */
function updateFooterCount(n) {
  if (!n || isNaN(n) || n <= 0) return false;
  var el = document.getElementById('footerCount');
  if (el) el.textContent = n;
  return true;
}

function extractScCount() {
  var c = document.getElementById('sc-hidden');
  if (!c) return false;
  var imgs = c.querySelectorAll('img');
  for (var i = 0; i < imgs.length; i++) {
    var alt = (imgs[i].getAttribute('alt') || '').trim();
    var n   = parseInt(alt, 10);
    if (!isNaN(n) && n > 0 && n < 1000000) return updateFooterCount(n);
    var src = imgs[i].getAttribute('src') || '';
    var m   = src.match(/[?&](?:count|c|n|v)=(\d+)/i);
    if (m) { var n2 = parseInt(m[1], 10); if (!isNaN(n2) && n2 > 0) return updateFooterCount(n2); }
  }
  var els = c.querySelectorAll('span,b,strong,div,p');
  for (var j = 0; j < els.length; j++) {
    var v = parseInt((els[j].textContent || '').trim(), 10);
    if (!isNaN(v) && v > 0 && v < 1000000) return updateFooterCount(v);
  }
  return false;
}

var _scAttempts = 0;
var _scTimer = setInterval(function() {
  if (extractScCount() || ++_scAttempts > 60) clearInterval(_scTimer);
}, 500);

setTimeout(function() {
  var el = document.getElementById('footerCount');
  if (el && el.textContent === '--') el.textContent = '...';
}, 32000);

/* ── VISITOR HIT ── */
function initVisitorCounter() {
  fetch(IPL_DATA_URL, { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var s = d.sections && d.sections.find(function(x) { return x.slot === 'NEW'; });
      if (!s) return;
      fetch(VIEW_API_BASE + '/hit?key=' + encodeURIComponent('IPL-2026_' + s.id)).catch(function() {});
    }).catch(function() {});
}

/* ── SHIMMER ── */
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
  s.setAttribute('aria-hidden', 'true');
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

  prefetchStreamData().then(function(results) {
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
  var parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
  var last  = parts[parts.length - 1];
  return last ? decodeURIComponent(last) : '';
}

/* ── NOTIFICATIONS — load on page load, cache result ── */
var _notifLoaded = false;

function loadNotifications() {
  if (_notifLoaded) return;
  _notifLoaded = true;

  var list    = document.getElementById('notificationList');
  var skeleton= document.getElementById('notifSkeleton');
  if (!list) return;

  /* Use the already-fetched stream data which contains notifications */
  prefetchStreamData().then(function(results) {
    var items = [];
    for (var i = 0; i < results.length; i++) {
      if (!results[i]) continue;
      var n = results[i].notifications || results[i].announcements || [];
      if (Array.isArray(n) && n.length) { items = n; break; }
    }

    if (skeleton) skeleton.remove();

    if (!items.length) {
      list.innerHTML = '<div class="no-notification">No announcements right now.<br>Check back soon &#x1F914;</div>';
      return;
    }

    var frag = document.createDocumentFragment();
    items.slice(0, 6).forEach(function(item) {
      var card = document.createElement('div');
      card.className = 'notif-card';
      var visitBtn = item.url
        ? '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer" class="visit-btn-slide">View</a>'
        : '';
      card.innerHTML =
        '<div class="notif-message">' + (item.message || item.text || '') + '</div>' +
        '<div class="notif-footer">' +
          '<span class="notif-time">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-width="2" d="M12 6v6l4 2"/></svg>' +
            (item.time || item.date || 'Just now') +
          '</span>' +
          visitBtn +
        '</div>';
      frag.appendChild(card);
    });
    list.appendChild(frag);
  }).catch(function() {
    if (skeleton) skeleton.remove();
    if (list) list.innerHTML = '<div class="no-notification">Could not load announcements.</div>';
  });
}

/* ── SLIDE PANEL ── */
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
  bellBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); }
  });
  if (btnClose)     btnClose.addEventListener('click', closePanel);
  if (slideOverlay) slideOverlay.addEventListener('click', closePanel);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && slidePanel.classList.contains('open')) closePanel();
  });
}

/* ── SHARE ── */
function initShareButton() {
  var btn = document.getElementById('shareButton');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var url   = window.location.href;
    var title = document.title;
    var text  = title + '\n\nFrom Cricket News Point — Watch Live Cricket Free in HD!';
    if (navigator.share) { navigator.share({ title: title, text: text, url: url }).catch(function() {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(function() { showToast('Link Copied !!'); })
        .catch(function() { fallbackCopy(url); });
    } else { fallbackCopy(url); }
  });
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); showToast('Link Copied !!'); } catch(e) { alert('Link: ' + text); }
  document.body.removeChild(ta);
}

function showToast(msg) {
  var old = document.getElementById('cnpToast');
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var t = document.createElement('div');
  t.id = 'cnpToast'; t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%) translateY(10px);background:rgba(30,41,59,0.92);color:#fff;padding:10px 20px;border-radius:24px;font-size:13px;font-family:inherit;font-weight:500;white-space:nowrap;z-index:99999;opacity:0;transition:opacity 0.3s,transform 0.3s;pointer-events:none;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)';
  document.body.appendChild(t);
  requestAnimationFrame(function() { requestAnimationFrame(function() { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; }); });
  setTimeout(function() {
    t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 350);
  }, 2400);
}

/* ── FULLSCREEN LANDSCAPE LOCK ── */
function initFullscreen() {
  var events = ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'];
  events.forEach(function(ev) { document.addEventListener(ev, function() {
    var el = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (el && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function() {});
  }); });
}

/* ── INIT ── */
function initPopupButtons() {
  var j = document.getElementById('btnJoinNow');
  var a = document.getElementById('btnAlreadyJoined');
  if (j) j.addEventListener('click', joinNow);
  if (a) a.addEventListener('click', alreadyJoined);
}

document.addEventListener('DOMContentLoaded', function() {
  initPopupButtons();
  initSlidePanel();
  initShareButton();
  initFullscreen();
  loadStream(resolveTargetId());
  /* Pre-load notifications in background so panel opens instantly */
  setTimeout(loadNotifications, 800);
});
