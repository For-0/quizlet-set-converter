importScripts("./common/html5parser.min.js");
importScripts("./common/background.js");

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === "ping") sendResponse({ type: "pong" }); // Respond to availability detection pings
  else if (request.type === "fetch-set" && request.setId) {
    // Visibly update that the extension is loading
    chrome.action.setIcon({ tabId: sender.tab.id, path: loadingIcon });
    chrome.action.setTitle({ tabId: sender.tab.id, title: chrome.i18n.getMessage("loadingActionTitle") })
    getQuizletSet(request.setId)
      .then(set => sendResponse(set))
      .finally(() => {
        // Reset the extension action
        chrome.action.setIcon({ tabId: sender.tab.id, path: defaultIcon });
        chrome.action.setTitle({ tabId: sender.tab.id, title: chrome.i18n.getMessage("actionTitle") })
      });
    return true;
  }
});