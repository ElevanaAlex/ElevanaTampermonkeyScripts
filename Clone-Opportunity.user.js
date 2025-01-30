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
        console.log("Checking for Clone button...");
        const updateButton = document.querySelector("#CreateUpdateOpportunity");
        if (!updateButton) {
            console.log("Update button not found yet.");
            return;
        }
        
        if (document.querySelector("#CloneOpportunity")) {
            console.log("Clone button already exists.");
            return;
        }
        
        console.log("Adding Clone button...");
        const cancelButton = updateButton.previousElementSibling;
        const cloneButton = document.createElement("button");
        cloneButton.textContent = "Clone";
        cloneButton.id = "CloneOpportunity";
        cloneButton.className = "n-button n-button--primary-type n-button--medium-type h-11 min-w-[8rem]";
        cloneButton.style.backgroundColor = "#16A34A"; // Green color
        cloneButton.style.color = "white";
        cloneButton.style.border = "none";

        cloneButton.addEventListener("click", async () => {
            console.log("Clone button clicked.");
            const urlPath = window.location.pathname;
            const match = urlPath.match(/opportunities\/list\/([^/?]+)/);
            const opportunityId = match ? match[1] : null;

            console.log("Extracted Opportunity ID:", opportunityId);
            if (!opportunityId) {
                alert("Opportunity ID not found.");
                return;
            }

            const numClones = parseInt(prompt("How many opportunities would you like?"), 10);
            console.log("User requested clones:", numClones);
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
            .then(data => {
                console.log("Server response:", data);
                alert(data.message);
            })
            .catch(error => {
                console.error("Error cloning opportunity:", error);
                alert("Error cloning opportunity: " + error.message);
            });
        });

        cancelButton.parentNode.insertBefore(cloneButton, updateButton);
    }

    new MutationObserver(addCloneButton).observe(document.body, { childList: true, subtree: true });
})();
