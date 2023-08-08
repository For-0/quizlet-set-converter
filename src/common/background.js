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
        text = `<span class="bg-yellow-100 text-yellow-950">${text}</span>`;
        break;
      case "bgB": // blue bg
        text = `<span class="bg-blue-100 text-blue-950">${text}</span>`;
        break;
      case "bgP": // purple bg
        text = `<span class="bg-purple-100 text-purple-950">${text}</span>`;
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

/** parse the media of a single card side */
function parseMedia(media) {
  return media.map(({ type, richText, plainText, url }) => {
    if (type === 2) return `![${chrome.i18n.getMessage("imageAltText")}](${url})`;
    else if (richText) return parseRichText(richText);
    else if (plainText) return plainText;
    return null;
  }).filter(Boolean).join(" ");
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
  const terms = reduxState.studyModesCommon.studiableData.studiableItems.map(({ cardSides }) => {
    const { media: wordMedia } = cardSides.find(({ label }) => label === "word");
    const { media: definitionMedia } = cardSides.find(({ label }) => label === "definition");
    return {
      term: parseMedia(wordMedia),
      definition: parseMedia(definitionMedia)
    }

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

chrome.runtime.onInstalled.addListener(() => {
  browser.permissions.getAll().then(({ origins }) => {
    if (origins.length <= 0) chrome.tabs.create({ url: "/onboarding.html" });
  });
});