importScripts("./html5parser.min.js")

/** Convert Quizlet's rich text format into markdown + Vocabustudy classes */
function parseRichTextItem({ marks, text, type }) {
  if (type !== "text") return "";
  if (!marks) return text;
  marks.forEach(({ type }) => {
    switch (type) {
      case "b":
        text = `**${text}**`;
        break;
      case "u":
        text = `<span class="is-underlined">${text}</span>`;
        break;
      case "i":
        text = `*${text}*`;
        break;
      case "bgY":
        text = `<span class="text-bg-yellow">${text}</span>`;
        break;
      case "bgB":
        text = `<span class="text-bg-blue">${text}</span>`;
        break;
      case "bgP":
        text = `<span class="text-bg-red">${text}</span>`;
        break;
    }
  });
  return text;
}

/** Iterate over a rich text document, and call parseRichTextItem on each item inside each paragraph */
function parseRichText({ type, content }) {
  if (type !== "doc") return "";
  return content.map(({ type, content }) => {
    if (type !== "paragraph") return "";
    else return content.map(parseRichTextItem).join("");
  }).join("\n");
}

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

function getReduxState(nextData) {
  return JSON.parse(nextData.props.pageProps.dehydratedReduxStateKey);
}

async function getQuizletSet(setId) {
  const res = await fetch(`https://quizlet.com/${setId}/`);
  const resText = await res.text();
  const nextData = getNextData(resText);
  if (!nextData) return null;
  const reduxState = getReduxState(nextData);
  console.log(reduxState);
  if (!reduxState) return null;
  const { title: name, description, numTerms, timestamp, lastModified } = reduxState.setPage.set;
  const { username: creator, id: uid } = reduxState.setPage.creator;
  const createTime = timestamp * 1000;
  const updateTime = lastModified * 1000;
  const pathParts = ["quizlet", setId];
  const terms = Object.values(reduxState.setPage.termIdToTermsMap).map(({ word, definition, _imageUrl, wordRichText, definitionRichText }) => {
    let parsedWord = wordRichText ? parseRichText(wordRichText) : word;
    let parsedDefinition = definitionRichText ? parseRichText(definitionRichText) : definition;
    // Convert images to Vocabustudy Markdown images
    if (_imageUrl) parsedWord += ` ![image](${_imageUrl})`;
    return {
      term: parsedWord,
      definition: parsedDefinition
    };
  });
  return { name, description, numTerms, createTime, terms, updateTime, pathParts, creator, uid };
}

chrome.runtime.onMessageExternal.addListener((request, _sender, sendResponse) => {
  if (request.type === "ping") sendResponse({ type: "pong" }); // Respond to availability detection pings
  else if (request.type === "fetch-set" && request.setId) {
    getQuizletSet(request.setId).then(set => sendResponse(set));
    return true;
  }
});