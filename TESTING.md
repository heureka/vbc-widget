# Testing Guide

This guide provides a quick, CSP-proof way to test the widget with Tampermonkey. Choose one of the two independent setup paths below: either load the script directly from GitHub, or from your localhost over HTTP. Common prerequisites are listed first to avoid repetition.

## Common prerequisites (for both setups)

1) Install Tampermonkey (Chrome)
   - Chrome Web Store: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

2) Adjust extension permissions (once)
   - Right-click the Tampermonkey icon → Manage extension
   - Site access: add these hosts so Tampermonkey can fetch `@require` resources:
     - https://raw.githubusercontent.com/*
     - http://localhost/*
   - Ensure “Allow User Scripts” is enabled.

3) Usage scope (optional)
   - By default, the examples below run on all pages via `@match *://*/*`.
   - To restrict scope to a specific domain, change `@match` to e.g.:

   ```
   // @match        *://*.lidl.cz/*
   ```

---

## Setup A — Load from GitHub (raw.githubusercontent.com)

This setup fetches `widget.js` from the repository’s main branch.

1) Create a userscript
   - Left-click the Tampermonkey icon → Create a new script…
   - Paste the following, then save:

   ```
   // ==UserScript==
   // @name         VbC Widget (GitHub @require)
   // @namespace    https://github.com/heureka/vbc-widget
   // @version      0.1.0
   // @description  Loads the VbC widget via @require from GitHub
   // @match        *://*/*
   // @run-at       document-end
   // @grant        none
   // @require      https://raw.githubusercontent.com/heureka/vbc-widget/main/widget.js
   // ==/UserScript==
   ```
 
---

## Setup B — Load from localhost over HTTP

This setup serves `widget.js` from your machine and loads it via `@require` over HTTP. It avoids `file://` URLs and keeps behavior closer to production.

1) Start a local static server in the project folder
   - Node (npx): `npx serve . -l 8000`
   - Result: `http://localhost:8000` (or your chosen port) should load in the browser.

2) Create a userscript
   - Left-click the Tampermonkey icon → Create a new script…
   - Paste the following, then save (adjust the port/path if needed):

   ```
   // ==UserScript==
   // @name         VbC Widget (localhost @require)
   // @namespace    https://github.com/heureka/vbc-widget
   // @version      0.1.0
   // @description  Loads the VbC widget via @require from localhost
   // @match        *://*/*
   // @run-at       document-end
   // @grant        none
   // @require      http://localhost:8000/widget.js
   // ==/UserScript==
   ```
---

## Enable and use

After either setup, enable the userscript in the Tampermonkey dashboard (Installed userscripts), then browse to any test page that matches your `@match` rule. For the localhost setup, keep your local server running. Disable the userscript or the extension to stop it.

## Updating during development

- GitHub setup: When `widget.js` changes in the repo, force an update from Tampermonkey (right-click the icon) → Utilities → Check for userscripts updates.
- Localhost setup:
  - Refresh the page after saving `widget.js`.
  - If you see caching, append a cache-buster to `@require`, e.g. `http://localhost:8000/widget.js?v=dev`, or briefly toggle the userscript off and on.

---

## Auto‑reload while developing (localhost)

If you want the page to auto‑reload whenever `widget.js` changes (similar to PyCharm’s Live Edit), use this development userscript instead of the plain `@require` one. It fetches your local `widget.js`, injects it into the page, and polls for changes. On change, it reloads the tab so the new widget code is applied cleanly.

1) Keep your local HTTP server running (see “Setup B — Load from localhost over HTTP”). For example:
   - `npx serve . -l 8000` → your file is at `http://localhost:8000/widget.js`.

2) Create a development userscript in Tampermonkey and paste this code:

```
// ==UserScript==
// @name         VbC Widget Dev (auto-reload)
// @namespace    https://github.com/heureka/vbc-widget
// @version      0.1.0
// @description  Load localhost widget.js, run it, and reload the page when the file changes
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
      console.warn('[VbC Dev] Failed to load widget.js:', err);
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
          console.log('[VbC Dev] widget.js changed → reloading page');
          // Full reload is safest to reset widget state
          location.reload();
        }
      });
    }, POLL_MS);
  });
})();
```

Notes
- This runs only in your browser via Tampermonkey and does not affect production. It uses `@connect localhost` to allow cross‑origin requests to your local server.
- Full page reload is the most reliable way to apply updated code cleanly on third‑party pages. If you prefer to avoid reloads, you can replace `location.reload()` with `injectToPage(code2)`; ensure your widget is idempotent (cleans up previous DOM/state) to prevent duplication.
- If your local server adds caching, the `?t=…` query param forces a fresh fetch.
