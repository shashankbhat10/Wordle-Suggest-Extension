import { getActiveTabURL } from "./utils.js";
import list from "./finalWords.json" assert { type: "json" };

const getSuggestionButton = document.getElementById("get-suggestion-btn");

let constraints = {};

// const setConstraints = (currConstraints) => {
//   console.log("HERE TO SET");
//   constraints = currConstraints;
// };

getSuggestionButton.addEventListener("click", async () => {
  const activeTab = await getActiveTabURL();
  const existingList = document.getElementById("suggested-words-list");
  if (existingList) {
    existingList.remove();
  }
  const spinnerEl = document.getElementById("spinner");
  spinnerEl.classList.remove("hidden");

  const constraints = await chrome.tabs.sendMessage(activeTab.id, { type: "getConstraint" });
  if (constraints === null || constraints === undefined) {
  }

  const data = await chrome.tabs.sendMessage(activeTab.id, { type: "getPosition", chars: constraints });

  let words = list["list"];
  let pattern = ".....";
  console.log(data);
  for (let key in data["positions"]) {
    if (data["positions"][key][0] >= 0)
      pattern =
        pattern.substring(0, data["positions"][key][0]) + key + pattern.substring(data["positions"][key][0] + 1);
  }

  console.log(pattern);
  words = words.filter((word) => word.match(pattern));
  console.log("after pattern match");
  console.log(words);
  if (constraints["absent"].length > 0) {
    let absentPattern = constraints["absent"].join("|");
    words = words.filter((word) => !word.match(absentPattern));
  }

  let presentChars = [];

  for (let key in data["positions"]) {
    if (data["positions"][key][0] < 0) {
      presentChars.push(key);

      for (let index in data["positions"][key]) {
        let position = data["positions"][key][index];
        // console.log(Math.abs(position) - 1);
        // console.log(data["notAllowed"][Math.abs(position) - 1]);
        data["notAllowed"][Math.abs(position) - 1].push(key);
      }
    }
  }

  words = words.filter((word) => {
    for (let index in presentChars) {
      if (!word.includes(presentChars[index])) return false;
    }
    return true;
    // word.match(presentPattern)
  });
  console.log("after present");
  console.log(words);

  words = words.filter((word) => {
    for (let index = 0; index < 5; index++) {
      if (pattern.charAt(index) === ".") {
        if (data["notAllowed"][index].includes(word.charAt(index))) return false;
      }
    }
    return true;
  });

  let wordsList = null;
  if (words.length === 0) {
    wordsList = document.createElement("span");
    wordsList.id = "suggested-words-list";
    wordsList.classList.add("text-lg", "mt-2");
    wordsList.innerText = "No words available to suggest";
  }
  // else if (words.length <= 5) {
  //   wordsList = document.createElement("ul");

  //   for (let index = 0; index < words.length; index++) {
  //     let listItemEl = document.createElement("li");
  //     listItemEl.innerText = words[index];
  //     wordsList.appendChild(listItemEl);
  //   }
  // }
  else {
    wordsList = document.createElement("ul");
    wordsList.id = "suggested-words-list";
    wordsList.classList.add("list-disc", "pl-5");
    wordsList.innerHTML = "";
    wordsList.innerText = "";
    let selectedWords = [];
    if (words.length > 5) {
      let randomWords = words.sort(() => 0.5 - Math.random());
      randomWords = randomWords.slice(0, 5);
      selectedWords = [...randomWords];
    } else {
      selectedWords = [...words];
    }

    for (let index = 0; index < selectedWords.length; index++) {
      let listItemEl = document.createElement("li");
      listItemEl.innerText = selectedWords[index];
      listItemEl.classList.add("text-lg", "mb-2");
      wordsList.appendChild(listItemEl);
    }
  }

  const listDivEl = document.getElementById("suggested-words");
  listDivEl.appendChild(wordsList);

  spinnerEl.classList.add("hidden");
});
