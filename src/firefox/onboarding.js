const sectionInstructions = document.getElementById("section-instructions");
const sectionGranted = document.getElementById("section-granted");

const btnGrantPermissions = document.getElementById("btn-grant-permissions");
const permissions = { origins: ["https://vocabustudy.org/*", "https://quizlet.com/*"] };

// Check that permissions have been granted for vocabustudy.org and quizlet.com
browser.permissions.contains(permissions).then(granted => {
  if (granted) {
    sectionGranted.hidden = false;
    sectionInstructions.hiddden = true;
  } else {
    sectionGranted.hidden = true;
    sectionInstructions.hidden = false;
  }
});

btnGrantPermissions.addEventListener("click", () => {
  browser.permissions.request(permissions).then(granted => {
    if (granted) {
      sectionGranted.hidden = false;
      sectionInstructions.hidden = true;
    }
  });
});