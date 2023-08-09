chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("nytimes.com/games/wordle")) {
    const params = tab.url.split;

    chrome.runtime.sendMessage(tabId, { type: "test" });
  }
});
