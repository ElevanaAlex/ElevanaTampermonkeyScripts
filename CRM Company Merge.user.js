// ==UserScript==
// @name         CRM Company Merge
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Add a merge option to the CRM Companies view
// @author       Your Name
// @match        https://genie.entrepreneurscircle.org/v2/*
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function () {
    'use strict';

    const addMergeButton = () => {
        let deleteButton = document.querySelector('.bulk-delete-btn');

        if (!deleteButton) {
            return;
        }

        if (document.querySelector('.merge-button')) {
            return;
        }

        let mergeButton = document.createElement('button');
        mergeButton.textContent = 'Merge';
        mergeButton.className = 'merge-button inline-flex items-center pr-4 pl-2 border border-transparent text-md font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700';
        mergeButton.style.marginLeft = '10px';

        mergeButton.addEventListener('click', () => {
            handleMergeClick();
        });

        deleteButton.parentNode.insertBefore(mergeButton, deleteButton.nextSibling);
    };

    const handleMergeClick = () => {
        const selectedCompanies = getSelectedCompanies();

        if (selectedCompanies.length !== 2) {
            alert('Please select exactly 2 companies to merge.');
            return;
        }

        const keepCompany = prompt(
            `You selected:\n1. ${selectedCompanies[0].name}\n2. ${selectedCompanies[1].name}\n\nEnter the number of the company you want to KEEP:`
        );

        if (!keepCompany || !['1', '2'].includes(keepCompany)) {
            alert('Invalid choice. Merge cancelled.');
            return;
        }

        const keepId = selectedCompanies[keepCompany - 1].id;
        const keepName = selectedCompanies[keepCompany - 1].name;
        const deleteId = selectedCompanies[keepCompany === '1' ? 1 : 0].id;
        const deleteName = selectedCompanies[keepCompany === '1' ? 1 : 0].name;

        console.log(`Keeping company ID: ${keepId}`);
        console.log(`Deleting company ID: ${deleteId}`);

        if (confirm(`Are you sure you want to merge these companies?\n\nAll contacts from ${deleteName} will be re-assigned into ${keepName}, and all information on ${deleteName} will be lost.`)) {
            performMerge(keepId, deleteId, keepName);
        } else {
            alert('Operation Cancelled.');
        }
    };

    const getSelectedCompanies = () => {

        // Query rows with the blue border indicating they are selected
        const selectedRows = document.querySelectorAll('td[class*="border-blue-500"]');
        const companies = [];

        selectedRows.forEach(row => {
            // Get the embedded input field's value for the company ID
            const inputElement = row.querySelector('input[type="checkbox"]');
            const companyId = inputElement ? inputElement.value : null;

            // Get the company name from the span with class 'text-blue-500'
            const companyNameElement = row.querySelector('span.text-blue-500');
            const companyName = companyNameElement ? companyNameElement.textContent.trim() : null;

            if (companyId && companyName) {
                companies.push({ id: companyId, name: companyName });
            } else {
                console.warn('Could not extract company ID or name for a selected row:', row);
            }
        });

        return companies;
    };

    const performMerge = (keepId, deleteId, keepName) => {
        console.log(`Merging data from company ID ${deleteId} (${keepName}) into company ID ${keepId}...`);

        // Let's get cracking
        // Prepare the data to send in the body
        const mergeData = {
            mergeFromID: deleteId,
            mergeToID: keepId,
            mergeToName: keepName
        };

        // Send the request to the PHP backend
        fetch('https://api.elevana.com/genieai/merge_companies.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({mergeFromID: deleteId, mergeToID: keepId, mergeToName: keepName})
        })
            .then(response => response.json())
            .then(data => {
            console.log('Success:', data);
        })
            .catch((error) => {
            console.error('Error:', error);
        });
        alert('Merge complete.');
    };

    const observer = new MutationObserver(() => {
        addMergeButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    addMergeButton();
})();

