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
   - Node (npx): `npx serve ./widget.js -l 8000`
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
   // @require      http://localhost:8000
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
