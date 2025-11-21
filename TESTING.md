# Testing & Local Development

This project supports two ways to run the widget:

- On Chrome/Brave/Edge: directly as an unpacked extension.
- Any browser: Tampermonkey userscripts.

---

## 1) For testing with the widget as a browser extension

This uses `script/manifest.json` that loads widget script directly as a content script.

Setup:

- Open `chrome://extensions` → enable “Developer mode” → Load unpacked → select the `script/` folder.

Dev loop:

- Edit files
- Click “Reload” on the extension, then refresh your tab.

---

## 2) Tampermonkey userscript for localhost with auto‑reload

This variant hits a local HTTP server for widget files and reloads the page when they change.

Start a local static server serving the `script/` folder:

- Run: `npm run dev`

Create a Tampermonkey userscript with this code:

```
// ==UserScript==
// @name         VbC Widget Dev (localhost auto-reload)
// @namespace    https://github.com/heureka/vbc-widget
// @version      0.1.0
// @description  Load localhost widget script, run it, and reload the page when it changes
// @match        *://*/*
// @noframes
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function () {
  const BASE_URL = "http://localhost:8000/";
  const POLL_MS = 3000;
  const ENTRY_FILE = "gjs.js";
  const WATCH_FILES = [ENTRY_FILE, "widget.html"];

  // Simple string hash (djb2) to detect changes
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (h << 5) + h + str.charCodeAt(i);
    return h >>> 0;
  }

  function injectToPage(code) {
    const s = document.createElement("script");
    s.textContent = code;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
  }

  let lastHash = null;

  function fetchCode(url, cb) {
    GM_xmlhttpRequest({
      method: "GET",
      url: url + "?t=" + Date.now(), // cache-buster
      nocache: true,
      onload: function (resp) {
        if (resp.status >= 200 && resp.status < 300) {
          cb(null, resp.responseText);
        } else {
          cb(new Error("HTTP " + resp.status));
        }
      },
      onerror: function (err) {
        cb(err || new Error("Network error"));
      },
    });
  }

  fetchCode(BASE_URL + ENTRY_FILE, function (err, code) {
    if (err) {
      console.warn("[VbC Dev] Failed to load entry file", err);
      return;
    }
    lastHash = hash(code);
    injectToPage(code);

    const hashMap = Object.fromEntries([
      ...WATCH_FILES.map((file) => [file, null]),
      [ENTRY_FILE, lastHash],
    ]);

    // Poll for changes
    setInterval(function () {
      Object.entries(hashMap).forEach(([file, lastHash]) => {
        fetchCode(BASE_URL + file, function (err2, code2) {
          if (err2) return; // keep polling quietly
          const h2 = hash(code2);

          if (lastHash === null) {
            // first time we've seen this file
            hashMap[file] = h2;
            return;
          }

          if (h2 !== lastHash) {
            console.log(`[VbC Dev] ${file} changed → reloading page`);
            location.reload();
          }
        });
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
// @noframes
// @run-at       document-end
// @grant        none
// @require      https://raw.githubusercontent.com/heureka/vbc-widget/main/script/widget.js
// ==/UserScript==
```

Enable the userscript and browse any page. This always pulls from `main`.
