// ==UserScript==
// @name         GenieAI Custom CSS
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Add custom styles
// @author       You
// @match        https://genie.entrepreneurscircle.org/*
// @downloadURL  https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/GenieAI-Custom-CSS.user.js
// @updateURL    https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/GenieAI-Custom-CSS.user.js
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
    div .opportunity--card {
      visibility: hidden;
      height: 0;
    }
`);
