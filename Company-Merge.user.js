// ==UserScript==
// @name         CRM Company Merge
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Add a merge option to the CRM Companies view
// @author       Alex Pitcher
// @match        https://genie.entrepreneurscircle.org/*
// @downloadURL  https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/Company-Merge.user.js
// @updateURL    https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/Company-Merge.user.js
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function () {
    'use strict';
    console.log("Tampermonkey MERGE script started.");
    // Global variable to store company data
    let companyData = [];

    // Intercept XHR responses to fetch company data
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
        this.addEventListener('load', function () {
            if (url.includes('https://services.leadconnectorhq.com/objects/business/records/search')) { // Adjust if necessary
                try {
                    const data = JSON.parse(this.responseText);
                    companyData = (data.customObjectRecords || []).map(record => ({
                        id: record.id,
                        name: record.properties.name,
                    }));
                    console.log('Fetched Company Data:', companyData);
                } catch (err) {
                    console.error('Error parsing response:', err);
                }
            }
        });
        open.call(this, method, url, async, user, pass);
    };

    const addMergeButton = () => {
        let deleteButton = document.querySelector('.bulk-action-red-btn');

        if (!deleteButton) {
            return;
        }

        if (document.querySelector('.merge-button')) {
            return;
        }

        console.log("Attempting to add merge button...");

        let mergeButton = document.createElement('button');
        mergeButton.textContent = 'Merge';
        mergeButton.className = 'merge-button inline-flex items-center pr-4 pl-2 border border-transparent text-md font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700';
        mergeButton.style.marginLeft = '10px';

        mergeButton.addEventListener('click', () => {
            handleMergeClick();
        });

        deleteButton.parentNode.insertBefore(mergeButton, deleteButton.nextSibling);
        console.log("Merge button Added!");

    };

    const handleMergeClick = () => {
        const selectedCompanies = getSelectedCompanies();

        if (selectedCompanies.length !== 2) {
            alert(`Please select exactly 2 companies to merge. Youve selected ${selectedCompanies.length}`);
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
            // Find the row by searching for its text content
            const rows = document.querySelectorAll('div[class*="tabulator-row"]');
            rows.forEach(row => {
                const companyNameElement = row.querySelector('div[tabulator-field="properties.name"]');
                if (companyNameElement && companyNameElement.textContent.trim() === deleteName) {
                    row.style.display = 'none'; // Hide the row visually
                    console.log(`Row for "${deleteName}" has been hidden.`);
                }
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = false; // Uncheck the checkbox
                    console.log(`Row unticked.`);
                }
            });
        } else {
            alert('Operation Cancelled.');
        }
    };

    const getSelectedCompanies = () => {

        // Query rows with the blue border indicating they are selected
        const selectedRows = document.querySelectorAll('div[class*="tabulator-selected"]');
        const companies = [];

        selectedRows.forEach(row => {

            // Get the company name from the span with class 'text-blue-500'
            const companyNameElement = row.querySelector('div[tabulator-field="properties.name"]');
            const companyName = companyNameElement ? companyNameElement.textContent.trim() : null;
            console.log(`Found company name: ${companyName}`);
            if (companyName) {
                 // Match the name with the stored company data to find the ID
                const companyInfo = companyData.find(company => company.name === companyName);
                const companyId = companyInfo ? companyInfo.id : null;
                console.log(`Found company ID: ${companyId}`);
                companies.push({ id: companyId, name: companyName });
            } else {
                console.warn('Could not extract name for a selected row:', row);
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

