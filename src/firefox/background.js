const quizletSetIdRegex = /\/(\d+)\/[\w-]+\/vocabustudy\/?/

/** Find the __NEXT_DATA__ script JSON element and parse it */
function getNextData(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  const script = doc.querySelector("script#__NEXT_DATA__");
  if (!script) return null;
  return JSON.parse(script.innerText);
}

browser.webRequest.onBeforeRequest.addListener(requestDetails => {
  const matched = new URL(requestDetails.url).pathname.match(quizletSetIdRegex);
  // if for some reason we couldn't get the set ID, redirect back to the quizlet set page
  if (!matched) return { redirectUrl: requestDetails.url.replaceAll("/vocabustudy", "") };
  else return { redirectUrl: `https://vocabustudy.org/quizlet/${matched[1]}/view/` };
}, { urls: ["https://quizlet.com/*/vocabustudy/"], types: ["main_frame"] }, ["blocking"]);

browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab && message.type === "fetch-set") {
    return getQuizletSet(message.setId);
  }
});