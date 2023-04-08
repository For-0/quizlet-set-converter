importScripts("./html5parser.min.js");
importScripts("./common/background.js");

/** Find the __NEXT_DATA__ script JSON element and parse it */
function getNextData(htmlString) {
  let nextData = null;
  const ast = Html5parser.parse(htmlString)
  Html5parser.walk(ast, {enter: node => {
    if (
      node.type === Html5parser.SyntaxKind.Tag &&
      node.name === "script" &&
      node.attributes.some(attr => attr.name.value === "id" && attr.value.value === "__NEXT_DATA__")
    ) nextData = JSON.parse(node.body[0].value);
  }});
  return nextData;
}

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === "ping") sendResponse({ type: "pong" }); // Respond to availability detection pings
  else if (request.type === "fetch-set" && request.setId) {
    getQuizletSet(request.setId)
      .then(set => sendResponse(set));
    return true;
  }
});