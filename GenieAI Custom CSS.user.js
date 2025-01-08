// ==UserScript==
// @name         GenieAI Custom CSS
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add custom styles
// @author       You
// @match        https://genie.entrepreneurscircle.org/v2/*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
    div .opportunity--card {
      visibility: hidden;
      height: 0;
    }
`);
