// ==UserScript==
// @name         Change Dashboard Convert Dates Bigger Error
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Automatically clicks "analytics", changes US date format to UK format, makes any warning/error messages much bigger
// @match        https://genie.entrepreneurscircle.org/*
// @downloadURL  https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/Change-Dashboard-Convert-Dates-Bigger-Error.user.js
// @updateURL    https://github.com/ElevanaAlex/ElevanaTampermonkeyScripts/raw/refs/heads/main/Change-Dashboard-Convert-Dates-Bigger-Error.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let DoneIt = 0;
    console.log("Tampermonkey script started.");

    // Function to check and click the analytics element
    function checkAndClickAnalytics() {
        //console.log("Checking for analytics element...");

        const analyticsElement = document.querySelector('li.capitalize.dashboard--filter_item[data-filter="dashboard"]');

        if (analyticsElement) {
            //console.log("Analytics element found. Clicking on it.");
            if (DoneIt == 0){
                analyticsElement.click();
                DoneIt = 1;
            }
        } else {
            //console.log("Analytics element not found. Retrying...");
        }
    }


    // Function to convert date format in target elements
    function convertDateFormat() {
        const dateElements = document.querySelectorAll("div.opportunity--date > span");

        //console.log("Searching for dates...");

        dateElements.forEach(element => {
            const usDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            const text = element.innerText.trim();

            //console.log(`Found date ${text}`);

            // Check if date matches US format
            const match = usDateRegex.exec(text);
            if (match) {
                const [_, month, day, year] = match;

                // Convert month number to month name and add day suffix
                const dayWithSuffix = getDayWithSuffix(parseInt(day));
                const monthName = monthNames[parseInt(month) - 1]; // -1 because array index starts at 0

                // Format in "11th November 2024" format
                const ukFormattedDate = `${dayWithSuffix} ${monthName} ${year}`;
                //console.log(`Converted date from ${text} to ${ukFormattedDate}`);

                element.innerText = ukFormattedDate;
            }
        });
    }

    // Function to add ordinal suffix to day
    function getDayWithSuffix(day) {
        if (day > 3 && day < 21) return day + "th"; // for 11th to 19th
        switch (day % 10) {
            case 1: return day + "st";
            case 2: return day + "nd";
            case 3: return day + "rd";
            default: return day + "th";
        }
    }

    // Function to map month number to month name
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Function to apply custom styles when the notification appears
    const styleNotification = () => {
        const notificationWrapper = document.querySelector('.vue-notification-wrapper');
        const notificationBox = document.querySelector('.vue-notification-wrapper .notif-box');
        const notificationContent = document.querySelector('.vue-notification-wrapper .notif-header');

        if (notificationWrapper && notificationBox && notificationContent) {
            // Style the main notification wrapper to center it
            notificationWrapper.style.position = 'fixed';
            notificationWrapper.style.top = '50%';
            notificationWrapper.style.left = '50%';
            notificationWrapper.style.transform = 'translate(-50%, -50%)';
            notificationWrapper.style.width = '400px';
            notificationWrapper.style.height = '200px';
            notificationWrapper.style.display = 'flex';
            notificationWrapper.style.alignItems = 'center';
            notificationWrapper.style.justifyContent = 'center';
            notificationWrapper.style.zIndex = '9999'; // Bring to front

            // Style the notification box itself
            notificationBox.style.backgroundColor = '#ffcccc'; // Light red background
            notificationBox.style.border = '3px solid #ff0000'; // Bright red border
            notificationBox.style.padding = '10px';
            notificationBox.style.width = '100%';
            notificationBox.style.height = '100%';

            // Style the content inside the box
            notificationContent.style.cssText += 'color: #000 !important;'; // Force black text for readability
            notificationContent.style.fontSize = '1.5em';
            notificationContent.style.textAlign = 'center';
            notificationContent.style.overflow = 'hidden'; // Prevent text overflow
        }
    };

    // Set up an interval to monitor for URL changes (SPA support)
    setInterval(() => {
        //console.log("Checking url...");
        //console.log(location.href);
        if (location.href.includes("dashboard") || location.href.includes("opportunities")) {
            //lastUrl = location.href;

            // Re-run the click logic if the URL matches the target page
            if (location.href.includes("/dashboard")) {
                //console.log(`TamperMonkey: ON DASHBOARD PAGE ## ${DoneIt}`);
                if (DoneIt == 0) {
                    //console.log("Attempting change to analytics...");
                    checkAndClickAnalytics();
                }
            }
            // Re-run the click logic if the URL matches the target page
            if (location.href.includes("/opportunities/list")) {
                //console.log("TamperMonkey: ON PIEPLINE PAGE");
                convertDateFormat();
            }
        } else {
            DoneIt = 0;
        }
    }, 1000); // Check every 1 second for URL changes

    // Observe for changes in the document to catch when the notification appears
    const observer = new MutationObserver(styleNotification);
    observer.observe(document.body, { childList: true, subtree: true });

})();
