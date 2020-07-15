//@ts-check
console.info(
`-----------------------------------
[BOX CRITTERS TEXTURE PACK MANAGER]
A chrome extention created by TumbleGamer
-----------------------------------`
);

var browser = browser || chrome || msBrowser;

function sendMessageBG(type, content) {
	return new Promise((resolve, reject) => {
		browser.runtime.sendMessage({ type, content }, resolve);
	});
}

function getAsserFolderVersion(assetsFolder) {
	var regex = "(https:\/\/boxcritters.com\/media\/)|(-[^]*)";
	var version = assetsFolder.replace(regex, "");
	return version;
}

function runInPage(f) {
	var script = document.createElement("script");
	script.id = "tpm_runInPage";
	var scriptText = "window.addEventListener('load', ()=>{(" + f.toString() + `)(function TPM_sendMessage(type, content={}) {
		console.log("[TPM] Sending message:", { type, content });
	
		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(${browser.runtime.id},{ type, content },resolve);
		});
	});
	$('#tpm_runInPage').remove();
});`;
	script.appendChild(document.createTextNode(scriptText));
	(document.body || document.head || document.documentElement).appendChild(script);
}

function loadShader(shader) {
	runInPage(`(function(shader){
	return function() {
		console.log("[TPM] Loading Shader",shader.name,"...");
		loadShader(shader);
	}
})(${JSON.stringify(shader)})`);
}

function clearShaders() {
	runInPage(function () {
		clearShaders();
	});
}

function refreshRedirects() {
	return new Promise((resolve, reject) => {
		browser.runtime.sendMessage({ type: "refreshtp", content: data.currentTP }, resolve);
	});
}

async function refreshShaders() {
	var data = await sendMessageBG("getdata");
	console.log("[TPM]", data);
	data.currentShader && data.currentShader.forEach(i => {
		loadShader(data.shaders[i]);
	});
}
refreshShaders();

browser.runtime.onMessage.addListener(({ type, content }, sender, sendResponse) => {
	switch (type) {
		case "refreshpage":
			browser.tabs.reload();
			break;
		default:
			sendResponse();
			break;
	}
});
