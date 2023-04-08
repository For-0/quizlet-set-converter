const imageSizes = [16, 32, 48, 128];

/** Make a dictionary of pixel sizes to icon filenames for dynamically updating the action icon */
function makeIconDict(iconName) {
  return Object.fromEntries(imageSizes.map(size => [size, `/common/icons/${iconName}-${size}.png`]))
}

const defaultIcon = makeIconDict("icon");

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
  return {
    name,
    description,
    numTerms,
    createTime,
    terms,
    updateTime,
    pathParts,
    creator,
    uid,
    collections: [],
    visibility: 2 // public by default
  };
}