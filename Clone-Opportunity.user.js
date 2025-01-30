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

    waitForElement("#CreateUpdateOpportunity", (updateButton) => {
        const cancelButton = updateButton.previousElementSibling;
        
        const cloneButton = document.createElement("button");
        cloneButton.textContent = "Clone";
        cloneButton.className = "n-button n-button--primary-type n-button--medium-type h-11 min-w-[8rem]";
        cloneButton.style.backgroundColor = "#16A34A"; // Green color
        
        cloneButton.addEventListener("click", async () => {
            const urlPath = window.location.pathname;
            const match = urlPath.match(/opportunities\/list\/([^/?]+)/);
            const opportunityId = match ? match[1] : null;

            if (!opportunityId) {
                alert("Opportunity ID not found.");
                return;
            }

            const numClones = parseInt(prompt("How many opportunities would you like?"), 10);
            if (isNaN(numClones) || numClones < 1) {
                alert("Invalid number entered.");
                return;
            }

            fetch("https://yourserver.com/clone_opportunity.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ opportunityId, numClones })
            })
            .then(response => response.json())
            .then(data => alert(data.message))
            .catch(error => alert("Error cloning opportunity: " + error.message));
        });

        cancelButton.parentNode.insertBefore(cloneButton, updateButton);
    });
})();
