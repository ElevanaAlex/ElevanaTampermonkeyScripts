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

            showLoading();

            fetch("https://api.elevana.com/genieai/clone_opportunities.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({opportunityId: opportunityId, numClones: numClones})
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
            hideLoading();
            closeOpportunityPopup();
        });

        cancelButton.parentNode.insertBefore(cloneButton, updateButton);
    }
    function showLoading() {
        let loadingOverlay = document.createElement("div");
        loadingOverlay.id = "loadingOverlay";
        loadingOverlay.style.position = "fixed";
        loadingOverlay.style.top = "0";
        loadingOverlay.style.left = "0";
        loadingOverlay.style.width = "100%";
        loadingOverlay.style.height = "100%";
        loadingOverlay.style.background = "rgba(0, 0, 0, 0.5)";
        loadingOverlay.style.display = "flex";
        loadingOverlay.style.alignItems = "center";
        loadingOverlay.style.justifyContent = "center";
        loadingOverlay.style.zIndex = "9999";

        let spinner = document.createElement("div");
        spinner.style.border = "8px solid #f3f3f3";
        spinner.style.borderTop = "8px solid #3498db";
        spinner.style.borderRadius = "50%";
        spinner.style.width = "60px";
        spinner.style.height = "60px";
        spinner.style.animation = "spin 1s linear infinite";

        loadingOverlay.appendChild(spinner);
        document.body.appendChild(loadingOverlay);

        let style = document.createElement("style");
        style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
        document.head.appendChild(style);
    }

    function hideLoading() {
        let overlay = document.getElementById("loadingOverlay");
        if (overlay) {
            overlay.remove();
        }
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
