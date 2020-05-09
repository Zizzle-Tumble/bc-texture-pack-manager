
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {

		// do your things
		if (window) {
			console.log("[TPM] There is indeed a window here");
		} else {
			console.log("[TPM] i dont have acces to the window object");

		}

		if (window.GLSLFilter) {
			console.log("[TPM] There is indeed loadShader funtion");
		} else {
			console.log("[TPM] i dont have acces to the loadShader funtion");

		}

		if (window.world) {
			console.log("[TPM] There is indeed a world object");
		} else {
			console.log("[TPM] i dont have acces to the world object");

		}
	}
});