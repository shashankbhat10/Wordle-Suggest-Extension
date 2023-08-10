(() => {
  const getConstraints = () => {
    let constraints = {
      absent: [],
      correct: [],
      present: [],
      unused: [],
    };

    const keyboardEl = document.querySelector("div[class^='Keyboard-module_keyboard']");
    if (keyboardEl === null || keyboardEl === undefined) return null;

    let keyboardElChildrenArr = keyboardEl.children;
    for (let index = 0; index < keyboardElChildrenArr.length; index++) {
      let keyboardRowEl = keyboardElChildrenArr[index];
      let rowChildrenArr = keyboardRowEl.children;
      for (let childIndex = 0; childIndex < rowChildrenArr.length; childIndex++) {
        let buttonEl = rowChildrenArr[childIndex];
        const buttonVal = buttonEl.getAttribute("data-key");
        if (buttonEl.tagName === "BUTTON" && buttonVal.match(/[a-z]/i)) {
          const state = buttonEl.getAttribute("data-state");

          if (state === null) constraints.unused.push(buttonVal);
          else if (state === "present") constraints.present.push(buttonVal);
          else if (state === "correct") constraints.correct.push(buttonVal);
          else constraints.absent.push(buttonVal);
        }
      }
    }

    return constraints;
  };

  const getPositions = (chars) => {
    const boardEl = document.querySelector("div[class^='Board-module_board']");
    const boardRowsArr = boardEl.children[0].children;

    let positions = {};
    let notAllowed = [];

    for (let index = 0; index < 5; index++) {
      notAllowed.push(new Set());
    }

    let breakLoop = false;
    for (let index = 0; index < boardRowsArr.length; index++) {
      let rowEl = boardRowsArr[index];
      for (let cellIndex = 0; cellIndex < rowEl.children.length; cellIndex++) {
        let char = rowEl.children[cellIndex].firstChild.firstChild;
        if (char === null) {
          breakLoop = true;
          break;
        }

        const dataState = char.parentElement.getAttribute("data-state");
        if (dataState.includes("present")) {
          if (positions[char.textContent] === undefined) positions[char.textContent] = [];
          else if (positions[char.textContent].filter((position) => position > 0).length > 0) {
            continue;
          }

          positions[char.textContent].push(-1 * (cellIndex + 1));
        } else if (dataState.includes("correct")) {
          if (positions[char.textContent] === undefined) positions[char.textContent] = [];
          else if (positions[char.textContent].filter((position) => position < 0).length > 0)
            positions[char.textContent] = [];
          else if (positions[char.textContent].filter((position) => position > 0).length > 0) continue;

          positions[char.textContent].push(cellIndex);
        } else {
          notAllowed[cellIndex].add(char.textContent);
        }
      }

      if (breakLoop) break;
    }

    for (let index = 0; index < notAllowed.length; index++) {
      for (let charIndex = 0; charIndex < chars.length; charIndex++) {
        notAllowed[index].add(chars[charIndex]);
      }
    }

    let notAllowedArr = [];
    for (let index = 0; index < notAllowed.length; index++) {
      let arr = [...notAllowed[index]];
      notAllowedArr.push(arr);
    }

    console.log(positions);
    console.log(notAllowedArr);
    let data = { positions: positions, notAllowed: notAllowedArr };
    return data;
  };

  chrome.runtime.onMessage.addListener((msg, sender, response) => {
    const { type, chars } = msg;

    if (type === "getConstraint") {
      const constraints = getConstraints();
      response(constraints);
    } else if (type === "getPosition") {
      const positions = getPositions(chars["absent"]);
      response(positions);
    }
  });
})();
