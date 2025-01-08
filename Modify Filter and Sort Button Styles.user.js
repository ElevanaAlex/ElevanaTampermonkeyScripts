// ==UserScript==
// @name         Modify Filter and Sort Button Styles
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Change Filter and Sort button styles dynamically.
// @author       Alex Pitcher
// @match        https://genie.entrepreneurscircle.org/v2/*
// @grant        none
// @require      https://raw.githubusercontent.com/ElevanaAlex/ElevanaTampermonkeyScripts/main/Modify%20Filter%20and%20Sort%20Button%20Styles.user.js
// ==/UserScript==

(function () {
    'use strict';
    // testing the auto load into tampermonkey times a million
    // Function to update styles for filter buttons
    function updateFilterButtonStyles() {
        // Select all buttons with the filter class
        const buttons = document.querySelectorAll('div.d-flex.button');

        buttons.forEach(button => {
            const span = button.querySelector('span');
            const svg = button.querySelector('svg path'); // Select the path element inside the svg

            if (!span) return; // Skip if no span is found (unlikely)

            // Skip the "Sort" button based on its text content
            if (button.textContent.includes('Sort')) return;

            // Apply styles based on active/inactive state
            if (button.classList.contains('active')) {
                // Active filter button styles
                button.style.backgroundColor = '#ffeff4';
                span.style.color = '#eb004e';
                // Change SVG icon stroke color for active state
                svg.style.stroke = '#eb004e'; // Active state stroke color
            } else {
                // Inactive filter button styles
                button.style.backgroundColor = '#ffffff';
                span.style.color = '#344054';
                svg.style.stroke = '#344054'; // Active state stroke color
            }

            // Debugging logs (optional, remove if not needed)
            console.log('Processed button:', button.textContent.trim(), 'Active:', button.classList.contains('active'));
        });
    }

    // Observe for dynamic changes in the DOM
    const observer = new MutationObserver(updateFilterButtonStyles);

    // Start observing the parent container for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run to apply styles to existing buttons
    updateFilterButtonStyles();
})();
