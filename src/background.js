importScripts("./html5parser.min.js");

const imageSizes = [16, 32, 48, 128];

/** Make a dictionary of pixel sizes to icon filenames for dynamically updating the action icon */
function makeIconDict(iconName) {
  return Object.fromEntries(imageSizes.map(size => [size, `icons/${iconName}-${size}.png`]))
}

const defaultIcon = makeIconDict("icon");
const loadingIcon = makeIconDict("icon-loading");

/** Convert Quizlet's rich text format into markdown + Vocabustudy classes */
function parseRichTextItem({ marks, text, type }) {
  if (type !== "text") return "";
  if (!marks) return text;
  marks.forEach(({ type }) => {
    switch (type) {
      case "b": // bold
        text = `**${text}**`;
        break;
      case "u": // underline
        text = `<span class="is-underlined">${text}</span>`;
        break;
      case "i": // italic
        text = `*${text}*`;
        break;
      case "bgY": // yellow bg
        text = `<span class="text-bg-yellow">${text}</span>`;
        break;
      case "bgB": // blue bg
        text = `<span class="text-bg-blue">${text}</span>`;
        break;
      case "bgP": // purple bg
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
  if (!reduxState) return null;
  const { title: name, description, numTerms, timestamp, lastModified } = reduxState.setPage.set;
  const { username: creator, id: uid } = reduxState.setPage.creator;
  // timestamp and lastModified are in seconds
  const createTime = timestamp * 1000;
  const updateTime = lastModified * 1000;
  const pathParts = ["quizlet", setId];
  const terms = Object.values(reduxState.setPage.termIdToTermsMap).map(({ word, definition, _imageUrl, wordRichText, definitionRichText }) => {
    let parsedWord = wordRichText ? parseRichText(wordRichText) : word;
    let parsedDefinition = definitionRichText ? parseRichText(definitionRichText) : definition;
    // Convert images to Vocabustudy Markdown images
    if (_imageUrl) parsedWord += ` ![${chrome.i18n.getMessage("imageAltText")}](${_imageUrl})`;
    return {
      term: parsedWord,
      definition: parsedDefinition
    };
  });
  return { name, description, numTerms, createTime, terms, updateTime, pathParts, creator, uid };
}

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