//@ts-check
console.info("-----------------------------------");
console.info("[BOX CRITTERS TEXTURE PACK MANAGER]");
console.info("A chrome extention created by\nTumbleGamer");
console.info("-----------------------------------");



var browser = browser || chrome || msBrowser;

function getAsserFolderVersion(assetsFolder) {
    var regex = "(https:\/\/boxcritters.com\/media\/)|(-[^]*)";
    var version = assetsFolder.replace(regex, "");
    return version;
}

function runInPage(f) {
	var script = document.createElement("script");
	script.id = "tpm_runInPage";
	var scriptText = "(" + f.toString() + ")();" + `
	$('#tpm_runInPage').remove();
	`;
	script.appendChild(document.createTextNode(scriptText));
	(document.body||document.head||document.documentElement).appendChild(script);
}

function refreshRedirects() {
    return new Promise((resolve,reject)=>{
        browser.runtime.sendMessage({ type: "refreshtp", content: data.currentTP }, resolve);
    });
}

browser.runtime.onMessage.addListener(({ type, content }, sender, sendResponse) => {
    switch (type) {
        case "refreshpage":
            browser.tabs.reload();
            break;
        case "ping":
            sendResponse(true);
			break;
		case "loadShader":
			runInPage(function() {
				loadShader(content);
			});
			break;
		case "clearShaders":
			runInPage(function() {
				clearShaders();
			});
			break;
        default:
            sendResponse();
            break;
    }
});
