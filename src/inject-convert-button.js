const firstButton = document.querySelector(".SetPageInformation-headerOptions button");
const matched = location.pathname.match(/(\d+)\/[\w-]+\/?/);
if (firstButton && matched) {
  const vocabustudyBtnContainer = firstButton.parentElement.cloneNode(true);
  /** @type {HTMLButtonElement} */
  const vocabustudyBtn = vocabustudyBtnContainer.firstElementChild;
  vocabustudyBtn.classList.remove("AssemblyIconButton--secondary");
  vocabustudyBtn.classList.add("AssemblyIconButton--secondary-alwaysDark");
  vocabustudyBtn.setAttribute("aria-label", "Convert to Vocabustudy");
  vocabustudyBtn.lastChild.remove();
  vocabustudyBtn.title = "Convert to Vocabustudy Set";
  vocabustudyBtn.addEventListener("click", () => location.href = `https://vocabustudy.org/quizlet/${matched[1]}/view/`);
  vocabustudyBtn.appendChild(new Image(24, 24)).src = chrome.runtime.getURL("icons/icon-128.png");
  firstButton.parentElement.parentElement.insertBefore(vocabustudyBtnContainer, firstButton.parentElement);
}