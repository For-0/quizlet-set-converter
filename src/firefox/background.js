const quizletSetIdRegex = /\/(\d+)\/[\w-]+\/vocabustudy\/?/

browser.webRequest.onBeforeRequest.addListener(requestDetails => {
  const matched = new URL(requestDetails.url).pathname.match(quizletSetIdRegex);
  // if for some reason we couldn't get the set ID, redirect back to the quizlet set page
  if (!matched) return { redirectUrl: requestDetails.url.replaceAll("/vocabustudy", "") };
  else return { redirectUrl: `https://vocabustudy.org/quizlet/${matched[1]}/view/` };
}, { urls: ["https://quizlet.com/*/vocabustudy/"], types: ["main_frame"] }, ["blocking"]);

browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab && message.type === "fetch-set") {
    chrome.action.setIcon({ tabId: sender.tab.id, path: loadingIcon });
    chrome.action.setTitle({ tabId: sender.tab.id, title: chrome.i18n.getMessage("loadingActionTitle") });
    return getQuizletSet(message.setId)
      .finally(() => {
        // Reset the extension action
        chrome.action.setIcon({ tabId: sender.tab.id, path: defaultIcon });
        chrome.action.setTitle({ tabId: sender.tab.id, title: chrome.i18n.getMessage("actionTitle") })
      });
  }
});