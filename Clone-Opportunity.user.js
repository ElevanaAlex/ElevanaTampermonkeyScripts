// ==UserScript==
// @name         Clone Opportunity Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a "Clone" button next to the Update button in the Opportunity modal
// @match        https://genie.entrepreneurscircle.org/*
// @downloadURL  https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/Clone-Opportunity.user.js
// @updateURL    https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/Clone-Opportunity.user.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    function waitForModal() {
        const observer = new MutationObserver((mutations, obs) => {
            const updateBtn = document.querySelector("#CreateUpdateOpportunity");
            if (updateBtn) {
                addCloneButton(updateBtn);
                obs.disconnect();
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function addCloneButton(updateBtn) {
        if (document.querySelector("#CloneOpportunity")) return; // Avoid duplicate buttons

        // Create the new button
        const cloneBtn = document.createElement("button");
        cloneBtn.id = "CloneOpportunity";
        cloneBtn.className = "n-button n-button--primary-type n-button--medium-type h-11 min-w-[8rem]";
        cloneBtn.style.backgroundColor = "#16a34a"; // Green color
        cloneBtn.innerHTML = `<span class="n-button__content">Clone</span>`;
        
        cloneBtn.onclick = function() {
            const opportunityId = getOpportunityId(); // Extract from modal
            if (!opportunityId) return alert("Could not find Opportunity ID");
            
            const count = parseInt(prompt("How many opportunities would you like to create?", "1"), 10);
            if (isNaN(count) || count < 1) return;
            
            fetch(`https://yourserver.com/clone_opportunity.php?id=${opportunityId}&count=${count-1}`)
                .then(response => response.json())
                .then(data => alert("Cloning complete!"))
                .catch(error => alert("Error cloning: " + error));
        };
        
        // Insert button before Update button
        updateBtn.parentNode.insertBefore(cloneBtn, updateBtn);
    }

    function getOpportunityId() {
        // Example: Extracting from URL or hidden input field inside modal
        const modal = document.querySelector(".opportunity-modal");
        if (!modal) return null;
        
        const idField = modal.querySelector("[data-opportunity-id]");
        return idField ? idField.getAttribute("data-opportunity-id") : null;
    }

    waitForModal();
})();
