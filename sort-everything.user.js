// ==UserScript==
// @name         Sort Everything
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add custom styles
// @author       You
// @match        https://genie.entrepreneurscircle.org/*
// @downloadURL  https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/sort-everything.user.js
// @updateURL    https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/sort-everything.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    function makeColumnsSortable() {

        let headers = document.querySelectorAll('.tabulator-col:not(.tabulator-sortable)');

        headers.forEach(header => {
            const columnField = header.getAttribute('tabulator-field');
            if (!columnField) return;

            console.log(`➡ Making header sortable: ${header.innerText.trim()}`);

            header.classList.add('tabulator-sortable', 'clickable');

            let sortOrder = 1; // 1 = ascending, -1 = descending

            // Create a sort indicator
            let sortIndicator = document.createElement('span');
            sortIndicator.style.marginLeft = '5px';
            sortIndicator.innerText = ' 🔽';
            header.querySelector('.tabulator-col-title').appendChild(sortIndicator);

            header.addEventListener('click', function() {
                console.log(`🖱 Clicked header: ${header.innerText.trim()} (Sorting ${sortOrder === 1 ? "Ascending" : "Descending"})`);
                sortOrder *= -1;

                let rows = Array.from(document.querySelectorAll('.tabulator-row'));
                console.log(`📊 Found ${rows.length} rows.`);

                rows.sort((rowA, rowB) => {
                    let cellA = rowA.querySelector(`[tabulator-field="${columnField}"]`);
                    let cellB = rowB.querySelector(`[tabulator-field="${columnField}"]`);

                    if (!cellA || !cellB) return 0;

                    let valueA = cellA.innerText.trim();
                    let valueB = cellB.innerText.trim();

                    let dateA = Date.parse(valueA);
                    let dateB = Date.parse(valueB);

                    if (!isNaN(dateA) && !isNaN(dateB)) {
                        console.log(`📅 Sorting as dates.`);
                        return (dateA - dateB) * sortOrder;
                    }

                    return valueA.localeCompare(valueB, undefined, { numeric: true }) * sortOrder;
                });

                let tableBody = rows[0]?.parentNode;
                if (!tableBody) {
                    console.error("❌ Table body not found!");
                    return;
                }

                rows.forEach(row => tableBody.appendChild(row));
                console.log("✅ Rows sorted.");

                sortIndicator.innerText = sortOrder === 1 ? ' 🔼' : ' 🔽';
            });
        });
    }

    // MutationObserver to detect table changes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                makeColumnsSortable();
            }
        });
    });

    // Start observing the entire document for changes
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("👀 Watching for table updates...");
})();
