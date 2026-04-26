/* ═══════════════════════════════════════════════
   Cricket News Point — Parameter System
   ═══════════════════════════════════════════════ */

var allStreams = [];

/* ── Popup ── */
document.getElementById('popupJoinBtn').addEventListener('click', joinNow);
document.getElementById('popupSkipBtn').addEventListener('click', closePopup);

function joinNow() {
    localStorage.setItem('hasJoined', 'true');
    window.open('https://t.me/+dxIv8TLRVhU3OGQ1', '_blank');
    document.getElementById('popup').style.display = 'none';
}

function closePopup() {
    if (localStorage.getItem('hasJoined') === 'true') {
        document.getElementById('popup').style.display = 'none';
        return;
    }
    var skip = parseInt(localStorage.getItem('skipCount') || '0') + 1;
    localStorage.setItem('skipCount', skip);
    if (skip >= 3) { joinNow(); }
    else { document.getElementById('popup').style.display = 'none'; }
}

function showPopup() {
    document.getElementById('popup').style.display = 'flex';
}

/* ── Slide Panel ── */
document.getElementById('bellBtn')?.addEventListener('click', openPanel);
document.getElementById('closePanelBtn').addEventListener('click', closePanel);
document.getElementById('slideOverlay').addEventListener('click', closePanel);

function openPanel() {
    document.getElementById('slideOverlay').classList.add('active');
    document.getElementById('slidePanel').classList.add('active');
    document.body.style.overflow = 'hidden';
    loadNotifications();
}

function closePanel() {
    document.getElementById('slideOverlay').classList.remove('active');
    document.getElementById('slidePanel').classList.remove('active');
    document.body.style.overflow = '';
}

function loadNotifications() {
    var list = document.getElementById('notificationList');
    list.innerHTML =
        '<div class="loading-skeleton">' +
            '<div class="skeleton-card"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>' +
            '<div class="skeleton-card"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>' +
            '<div class="skeleton-card"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>' +
        '</div>';

    setTimeout(function() {
        if (allStreams.length === 0) {
            list.innerHTML = '<div class="no-notification">No live streams available right now.</div>';
            return;
        }
        var html = '';
        allStreams.forEach(function(s, i) {
            var url = window.location.pathname + '?id=' + encodeURIComponent(s.id);
            html +=
                '<div class="notif-card" onclick="visitStream(\'' + encodeURIComponent(s.id) + '\')">' +
                    '<div class="notif-message">' + escHtml(s.name) + '</div>' +
                    '<div class="notif-footer">' +
                        '<div class="notif-meta">' +
                            '<span class="notif-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> LIVE</span>' +
                            '<span class="notif-views"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8 4-8 11-8z"/><circle cx="12" cy="12" r="3"/></svg> Stream</span>' +
                        '</div>' +
                        '<a class="visit-btn-slide" href="' + url + '">Visit →</a>' +
                    '</div>' +
                '</div>';
        });
        list.innerHTML = html;
    }, 800);
}

function visitStream(id) {
    window.location.href = window.location.pathname + '?id=' + id;
}

function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

/* ── Share ── */
function setupShare(data) {
    var btn = document.getElementById('shareBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        var shareData = {
            title: data.name,
            text: data.name + '\n\nFrom Cricket News Point\n\nWatch Live Cricket Streaming Free in HD!',
            url: window.location.href
        };
        if (navigator.share) {
            navigator.share(shareData).then(function() {
                setShareFeedback(btn, 'Shared Successfully');
            }).catch(function() {
                fallbackCopy(data.name, btn);
            });
        } else {
            fallbackCopy(data.name, btn);
        }
    });
}

function fallbackCopy(name, btn) {
    var text = name + '\n\nFrom Cricket News Point\n\n' + window.location.href;
    navigator.clipboard.writeText(text).then(function() {
        setShareFeedback(btn, 'Link Copied!');
    });
}

function setShareFeedback(btn, msg) {
    btn.innerHTML = msg;
    btn.classList.add('copied');
    setTimeout(function() {
        btn.innerHTML = '<i class="fa-solid fa-share-nodes" style="font-size:16px"></i> Share This Stream';
        btn.classList.remove('copied');
    }, 2200);
}

/* ── Orientation Lock ── */
function lockLandscape() {
    try {
        if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape');
        if (screen.lockOrientation) return { locked: !!screen.lockOrientation('landscape') };
        return { locked: false };
    } catch (e) { return { locked: false }; }
}
function unlockOrientation() {
    try {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        else if (screen.unlockOrientation) screen.unlockOrientation();
    } catch (e) {}
}
function applyRotateFallback() {
    var p = document.getElementById('playerWrap');
    if (p) p.classList.add('player-rotated');
}
function removeRotateFallback() {
    var p = document.getElementById('playerWrap');
    if (p) p.classList.remove('player-rotated');
}
function onFSChange() {
    var fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (fs) { lockLandscape().then(function(r) { if (!r.locked) applyRotateFallback(); }); }
    else { unlockOrientation(); removeRotateFallback(); }
}
document.addEventListener('fullscreenchange', onFSChange);
document.addEventListener('webkitfullscreenchange', onFSChange);

/* ── Render Functions ── */
function renderStreamPage(data) {
    var c = document.getElementById('mainContainer');
    c.innerHTML =
        '<div class="card">' +
            '<div class="header-content">' +
                '<span class="header">CRICKET NEWS POINT</span>' +
            '</div>' +
            '<div class="bell-container" id="bellBtn">' +
                '<svg class="bell-svg" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C10.63 5.36 9 7.92 9 11v5l-1 2h8l-1-2z"/></svg>' +
            '</div>' +
        '</div>' +
        '<div class="stream-badge">' +
            '<span class="stream-badge-dot"></span>' +
            '<span class="stream-badge-name">' + escHtml(data.name) + '</span>' +
        '</div>' +
        '<div class="video-wrapper" id="playerWrap">' +
            '<iframe src="' + data.iframeSrc + '" allow="encrypted-media; autoplay; fullscreen" allowfullscreen></iframe>' +
        '</div>' +
        '<div class="info-card join-card">' +
            '<div class="action-title">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#43A047" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>' +
                '<span style="font-size:13px;color:#6b7280;font-weight:500;font-family:Plus Jakarta Sans,sans-serif">Join for Instant Updates</span>' +
            '</div>' +
            '<a href="https://t.me/+dxIv8TLRVhU3OGQ1" target="_blank" rel="noopener" class="action-button btn-join-style">' +
                '<i class="fa-brands fa-whatsapp" style="font-size:17px"></i> Join WhatsApp Channel' +
            '</a>' +
        '</div>' +
        '<div class="info-card share-card">' +
            '<div class="action-title">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>' +
                '<span style="font-size:13px;color:#6b7280;font-weight:500;font-family:Plus Jakarta Sans,sans-serif">Share With Friends</span>' +
            '</div>' +
            '<button class="action-button btn-share-style" id="shareBtn">' +
                '<i class="fa-solid fa-share-nodes" style="font-size:16px"></i> Share This Stream' +
            '</button>' +
        '</div>';

    setupShare(data);
}

function renderErrorPage() {
    var c = document.getElementById('mainContainer');
    c.innerHTML =
        '<div class="card">' +
            '<div class="header-content">' +
                '<span class="header">CRICKET NEWS POINT</span>' +
            '</div>' +
            '<div class="bell-container" id="bellBtn">' +
                '<svg class="bell-svg" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C10.63 5.36 9 7.92 9 11v5l-1 2h8l-1-2z"/></svg>' +
            '</div>' +
        '</div>' +
        '<div class="error-box" style="display:block">' +
            '⚠ Invalid or unavailable stream ID. Check the link or tap the bell to browse live streams.' +
        '</div>';
}

function renderSelectPrompt() {
    var c = document.getElementById('mainContainer');
    c.innerHTML =
        '<div class="card">' +
            '<div class="header-content">' +
                '<span class="header">CRICKET NEWS POINT</span>' +
            '</div>' +
            '<div class="bell-container" id="bellBtn">' +
                '<svg class="bell-svg" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C10.63 5.36 9 7.92 9 11v5l-1 2h8l-1-2z"/></svg>' +
            '</div>' +
        '</div>' +
        '<div class="select-prompt" style="display:block">' +
            '<div class="select-prompt-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' +
            '</div>' +
            '<p class="select-prompt-text"><strong>No stream selected.</strong><br>Tap the bell icon to browse all live streams.</p>' +
        '</div>';
}

/* ── App Init ── */
async function initializeApp() {
    try {
        var r1 = await fetch('https://sayan-json-official.pages.dev/loura.json');
        var r2 = await fetch('https://allrounderid2.pages.dev/id.json');
        var d1 = r1.ok ? (await r1.json()).iframes || [] : [];
        var d2 = r2.ok ? (await r2.json()).iframes || [] : [];
        allStreams = d1.concat(d2);

        var id = new URLSearchParams(window.location.search).get('id');
        var stream = allStreams.find(function(s) { return s.id === id; });

        if (stream) {
            renderStreamPage(stream);
            setTimeout(showPopup, 1200);
        } else if (id) {
            renderErrorPage();
        } else {
            renderSelectPrompt();
            setTimeout(openPanel, 600);
        }
    } catch (err) {
        console.error(err);
        renderErrorPage();
    }

    startCounterExtraction();
}

document.addEventListener('DOMContentLoaded', initializeApp);

/* ── Supercounters Extraction ── */
function extractCounter() {
    var h = document.getElementById('sc-hidden');
    if (!h) return null;
    var img = h.querySelector('img');
    if (img && img.alt) { var n = parseInt(img.alt, 10); if (!isNaN(n) && n > 0) return n; }
    var sp = h.querySelector('span');
    if (sp && sp.textContent) { var n2 = parseInt(sp.textContent, 10); if (!isNaN(n2) && n2 > 0) return n2; }
    var all = h.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
        var t = (all[i].alt || all[i].textContent || '').trim();
        var n3 = parseInt(t, 10); if (!isNaN(n3) && n3 > 0) return n3;
    }
    return null;
}

function startCounterExtraction() {
    var attempts = 0;
    var poll = setInterval(function() {
        attempts++;
        var count = extractCounter();
        if (count !== null) { clearInterval(poll); displayCounter(count); }
        if (attempts >= 15) clearInterval(poll);
    }, 500);
    setTimeout(function() {
        var fc = document.getElementById('footerCount');
        if (fc && fc.textContent === '--') displayCounter(770);
    }, 3500);
}

function displayCounter(num) {
    var el = document.getElementById('footerCount');
    if (el) el.textContent = num;
}
