# Testing Guide

This guide provides a quick, CSP-proof way to test the widget.

## Testing with Tampermonkey (Chrome)

This is a short, CSP-proof setup to load the widget from GitHub (or local file) via Tampermonkey, suitable for quick desktop testing on merchant pages.

1) Install Tampermonkey (Chrome)
   - Chrome Web Store: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

2) Adjust extension permissions (once)
   - Right-click the Tampermonkey icon → Manage extension
   - Site access: add https://raw.githubusercontent.com/*
   - Enable “Allow User Scripts”
   - Enable “Allow access to file URLs”

3) Add the userscript (loads from GitHub)
   - Left-click the Tampermonkey icon → Create a new script…
   - Paste this code, then save:

   ```
   // ==UserScript==
   // @name         VbC Widget (GitHub @require)
   // @namespace    https://github.com/heureka/vbc-widget
   // @version      0.1.0
   // @description  Loads the widget via @require
   // @match        *://*/*
   // @run-at       document-end
   // @grant        none
   // @require      https://raw.githubusercontent.com/heureka/vbc-widget/main/widget.js
   // ==/UserScript==
   ```

4) Enable
   - In the Tampermonkey dashboard, open the Installed Userscripts tab and ensure this script is enabled (toggle on).

5) Use
   - With the script enabled, it will be active on any page while the Tampermonkey extension is enabled. Disable the script (or the extension) to stop it.

6) Local testing (loads from local file)
   - To test locally, save `widget.js` to a local file and change `@require` to point to that file using its absolute path.
   - Require will then e.g. look like this:

   ```
   // @require      file:///Users/yourname/vbc-widget/widget.js
   ```

   - Tip: Save this as a new userscript to switch between GitHub and local testing quickly. To rename the new userscript change the `@name` in the userscript to e.g.:

   ```
   // @name         VbC Widget (local @require)
   ```

7) Restrict scope (optional)
   - To restrict scope, change `@match` to e.g.: 

   ```
   // @match        *://*.lidl.cz/*
   ```

8) Reload widget (when needed)
   - If you update `widget.js`, you can force an update from the Tampermonkey context menu (right-click) → Utilities → Check for userscripts updates
