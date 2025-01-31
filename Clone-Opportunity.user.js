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

(() => {
    function waitForElement(selector, callback) {
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                callback(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function addCloneButton() {
        const updateButton = document.querySelector("#CreateUpdateOpportunity");
        if (!updateButton) {
            return;
        }
        if (document.querySelector("#CloneOpportunity")) {
            return;
        }
        const cancelButton = updateButton.previousElementSibling;
        const cloneButton = document.createElement("button");
        cloneButton.textContent = "Clone";
        cloneButton.id = "CloneOpportunity";
        cloneButton.className = "n-button n-button--primary-type n-button--medium-type h-11 min-w-[8rem]";
        cloneButton.style.backgroundColor = "#1D5E3B !important"; // Green color
        cloneButton.style.color = "white";
        cloneButton.style.border = "none";

        const style = document.createElement("style");
        style.textContent = `
            #CloneOpportunity {
            background-color: #1D5E3B !important;
            color: white !important;
            border: none !important;
            margin-right: 8px;
            }
        `;
        document.head.appendChild(style);

        cloneButton.addEventListener("click", async () => {
            const opportunityId = getOpportunityId();
            if (opportunityId) {
                //console.log("Opportunity ID:", opportunityId);
            } else {
                console.error("Failed to retrieve Opportunity ID.");
                alert("Opportunity ID not found.");
                return;
            }

            const numClones = parseInt(prompt("How many opportunities would you like?"), 10);
            if (isNaN(numClones) || numClones < 1) {
                alert("Invalid number entered.");
                return;
            }

            fetch("https://api.elevana.com/genieai/clone_opportunities.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({opportunityId: opportunityId, numClones: numClones})
            })
                .then(response => response.json())
                .then(data => {
                alert(data.message);
            })
                .catch(error => {
                console.error("Error cloning opportunity:", error);
                alert("Error cloning opportunity: " + error.message);
            });
            closeOpportunityPopup();
        });
        cancelButton.parentNode.insertBefore(cloneButton, updateButton);
    }

    function getOpportunityId() {
        // Try to get the ID from the URL first
        const urlPath = window.location.pathname;
        const match = urlPath.match(/opportunities\/list\/([^/?]+)/);
        if (match && match[1]) {
            return match[1]; // Return the ID from the URL
        }

        // If not found, try to get it from the Audit Logs element
        const auditLogElement = document.querySelector('.flex.items-center.text-xs > .cursor-pointer.text-blue-700');
        if (auditLogElement) {
            return auditLogElement.textContent.trim(); // Return the ID from the Audit Logs
        }

        // If no ID is found, return null
        console.warn("Opportunity ID not found in URL or Audit Logs.");
        return null;
    }
    function closeOpportunityPopup() {
        let closeButton = document.getElementById("modal-header-modal-close-btn");
        if (closeButton) {
            closeButton.click();
        } else {
            console.warn("Close button not found!");
        }
    }
    new MutationObserver(addCloneButton).observe(document.body, { childList: true, subtree: true });
})();
