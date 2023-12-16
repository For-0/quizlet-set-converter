const firstButton = document.querySelector(".SetPageHeader-headerOptions button");
const matched = location.pathname.match(/(\d+)\/[\w-]+\/?/);
if (firstButton && matched) {
  // Add a circular icon button with the convert icon
  const vocabustudyBtn = document.createElement("a");
  vocabustudyBtn.style.padding = "6px";
  vocabustudyBtn.style.borderRadius = "50%";
  vocabustudyBtn.classList.add("AssemblyButtonBase", "AssemblyButtonBase--medium", "AssemblyIconButton--secondary-alwaysDark");
  vocabustudyBtn.setAttribute("aria-label", "Convert to Vocabustudy");
  vocabustudyBtn.title = "Convert to Vocabustudy Set";

  vocabustudyBtn.href = `https://vocabustudy.org/quizlet/${matched[1]}/view/`;

  const vocabustudyImage = vocabustudyBtn.appendChild(new Image(24, 24));
  vocabustudyImage.src = chrome.runtime.getURL("/common/icons/icon-128.png");

  firstButton.parentElement.prepend(vocabustudyBtn);
}