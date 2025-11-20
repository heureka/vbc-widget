# Testing & Local Development

This project supports two ways to run the widget:
- Preferred on Chrome/Brave/Edge: directly as an unpacked extension.
- Backup on any browser: Tampermonkey userscripts.

---

## 1) Local development with the widget as a browser extension (preferred)

Goal: Edit `script/widget.js` locally and see changes immediately with one reload.

This uses `script/manifest.json` that loads `widget.js` directly as a content script.

Setup:
- Open `chrome://extensions` → enable “Developer mode” → Load unpacked → select the `script/` folder.

Dev loop:
- Edit and save `script/widget.js`.
- Click “Reload” on the extension, then refresh your tab.

---

## 2) Tampermonkey userscript for localhost with auto‑reload

This variant hits a local HTTP server for `script/widget.js` and reloads the page when the file changes.

Start a local static server serving the `script/` folder:
- Run: `npm run dev`

Then your file is at: `http://localhost:8000/widget.js`

Create a Tampermonkey userscript with this code:

```
// ==UserScript==
// @name         VbC Widget Dev (localhost auto-reload)
// @namespace    https://github.com/heureka/vbc-widget
// @version      0.1.0
// @description  Load localhost script/widget.js, run it, and reload the page when it changes
// @match        *://*/*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function() {
  const URL = 'http://localhost:8000/widget.js'; // adjust port/path if needed
  const POLL_MS = 1000; // 1s polling; increase if too frequent

  // Simple string hash (djb2) to detect changes
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return h >>> 0;
  }

  function injectToPage(code) {
    const s = document.createElement('script');
    s.textContent = code;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
  }

  let lastHash = null;

  function fetchCode(cb) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: URL + '?t=' + Date.now(), // cache-buster
      nocache: true,
      onload: function(resp) {
        if (resp.status >= 200 && resp.status < 300) {
          cb(null, resp.responseText);
        } else {
          cb(new Error('HTTP ' + resp.status));
        }
      },
      onerror: function(err) { cb(err || new Error('Network error')); }
    });
  }

  // Initial load: run the widget code once
  fetchCode(function(err, code) {
    if (err) {
      console.warn('[VbC Dev] Failed to load script/widget.js:', err);
      return;
    }
    lastHash = hash(code);
    injectToPage(code);

    // Start polling for changes
    setInterval(function() {
      fetchCode(function(err2, code2) {
        if (err2) return; // keep polling quietly
        const h2 = hash(code2);
        if (h2 !== lastHash) {
          console.log('[VbC Dev] script/widget.js changed → reloading page');
          // Full reload is safest to reset widget state
          location.reload();
        }
      });
    }, POLL_MS);
  });
})();
```

---

## 3) Tampermonkey userscript with GitHub @require

For quick verification on any browser with Tampermonkey installed:

```
// ==UserScript==
// @name         VbC Widget (GitHub @require)
// @namespace    https://github.com/heureka/vbc-widget
// @version      0.1.0
// @description  Loads the VbC widget from GitHub
// @match        *://*/*
// @run-at       document-end
// @grant        none
// @require      https://raw.githubusercontent.com/heureka/vbc-widget/main/script/widget.js
// ==/UserScript==
```

Enable the userscript and browse any page. This always pulls from `main`.
