'use strict';

let isThanos = false

toggleSwitch.onchange = function(element) {
    isThanos = !isThanos
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            data: isThanos
        });
    });
}
