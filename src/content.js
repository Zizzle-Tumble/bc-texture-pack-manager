//@ts-check
var browser = browser || chrome || msBrowser;
var RESET_ON_RELOAD = false;
var data = {
    currentTP: -1,
    editing: -1,
    texturePacks: []
}

function getAsserFolderVersion(assetsFolder) {
    var regex = "(https:\/\/boxcritters.com\/media\/)|(-[^]*)";
    var version = assetsFolder.replace(regex, "");
    return version;
}




function initDefaultTP() {

}

initDefaultTP();

const resetdata = data;

function refreshRedirects() {
    return new Promise((resolve,reject)=>{
        browser.runtime.sendMessage({ type: "refreshtp", content: data.currentTP }, resolve);
    });
}

function save() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.set({ 'bctpm': data }, resolve);
    });
}

function load() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get(["bctpm"], (storage) => {
            data = storage.bctpm || data;
            if (resetdata.bc !== data.bc) {
                data.bc = resetdata.bc;
            }
            resolve(data);
        });
    });
}



function reset() {
    data = resetdata;
    return save();
}

//debugger;
if (RESET_ON_RELOAD) {
    reset();
}
load();

browser.runtime.onMessage.addListener(({ type, content }, sender, sendResponse) => {
    switch (type) {
        case "addtp":
            var id = data.texturePacks.push(content)-1;
            data.currentTP = id;
            save().then(() => {
                //browser.browserAction.setBadgeText({ text: data.texturePacks.length });
                sendResponse("Texture Pack successfuly added.");
            });
            break;
        case "gettp":
            sendResponse(data.texturePacks);
            break;
        case "getdata":
            sendResponse(data);
            break;
        case "refreshpage":
            browser.tabs.reload();
            break;
        case "settp":
            data.currentTP = content.id;
            save().then(() => {
                refreshRedirects().then(()=>{
                    sendResponse("Texture Pack successfuly set.");
                });
            });
            break;
        case "deletetp":
            if(data.currentTP === content.id){
                data.currentTP = -1;
            }
            data.texturePacks.splice(content.id,1);
            save().then(() => {
                refreshRedirects().then(()=>{
                    sendResponse("Texture Pack successfuly deleted.");
                });
            });
            break;
        case "tpexists":
            sendResponse(data.texturePacks.map(tp => tp.name).includes(content));
            break;
        case "reset":
            reset().then(() => {
                refreshRedirects().then(()=>{
                    sendResponse("reset");
                });
            });
            break;
        case "ping":
            sendResponse(true);
            break;
        default:
            sendResponse();
            break;
    }
});
