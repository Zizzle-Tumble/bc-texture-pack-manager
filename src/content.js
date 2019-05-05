//@ts-check
// @ts-ignore
var chrome = chrome || browser;
var RESET_ON_RELOAD = false;
var data = {
    currentTP: -1,
    editing: -1,
    texturePacks: [],
    bc: "https://boxcritters.com/media/38-moveit/",
    from: {
        hamster: "critters/hamster.png",
        snail: "critters/snail.png",
        items: "items/items.png",
        tavenProps: "rooms/HamTavern_SM.png",
        beaver:""
    }
}

function getAsserFolderVersion(assetsFolder) {
    var regex = "(https:\/\/boxcritters.com\/media\/)|(-[^]*)";
    var version = assetsFolder.replace(regex, "");
    return version;
}

function getCurrentVersionInfo() {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'https://bc-mod-api.herokuapp.com/', true); // Replace 'my_data' with the path to your file
    return new Promise((resolve, reject) => {
        xobj.onreadystatechange = () => {
            if (xobj.readyState == 4 && xobj.status == 200) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                resolve(JSON.parse(xobj.responseText));
            }
        };
        xobj.send(null);
    });
}

//update assets folder
getCurrentAssetsFolder().then(af=>{
    if(data.bc != af) {
        data.bc = af;
    }
})

function addDefault() {
    let tp = {};
    tp.name = "BoxCritters";
    tp.version = 0;
    data.texturePacks.push(tp);
}

async function getCurrentAssetsFolder() {
    return (await getCurrentVersionInfo()).assetsFolder;
}



function initDefaultTP() {
    data.texturePacks.push({
        version: '0',
        name: 'CuteCritters',
        description: 'this texture pack has been in the making for almost 2 days now. it is my attempt to recreate the pink critter. i hope you enjoy. inspired by @Cutiejea\'s profile picture!',
        hamster: 'https://i.imgur.com/IXWBAYU.png',
        snail: 'https://i.imgur.com/WLqEUEy.png'
      })
}
initDefaultTP();

const resetdata = data;

function refreshRedirects() {
    return new Promise((resolve,reject)=>{
        chrome.runtime.sendMessage({ type: "refreshtp", content: data.currentTP }, resolve);
    });
}

function save() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ 'bctpm': data }, resolve);
    });
}

function load() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(["bctpm"], (storage) => {
            data = storage.bctpm || data;
            if (resetdata.from !== data.from) {
                data.from = resetdata.from;
            }
            if (resetdata.bc !== data.bc) {
                data.bc = resetdata.bc;
            }
            resolve(data);
        });
    });
}



function reset() {
    //chrome.storage.sync.set({"bctpm":undefined},()=>{});
    data = resetdata;
    return save();
}

//debugger;
if (RESET_ON_RELOAD) {
    reset();
}
load();

getFormats().then(f=>{
    var current = f.texturePacks.length-1;
    data.from = f.texturePacks[current].map(tp=>tp.default);
    data.from.filter(f=>f!==undefined);

})
getCurrentVersionInfo().then(v=>{
    data.from.script = `https://boxcritters.com/scripts/client${v.version}.min.js`
})




chrome.runtime.onMessage.addListener(({ type, content }, sender, sendResponse) => {
    switch (type) {
        case "addtp":
            var id = data.texturePacks.push(content)-1;
            data.currentTP = id;
            save().then(() => {
                //chrome.browserAction.setBadgeText({ text: data.texturePacks.length });
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
            chrome.tabs.reload();
            break;
        case "settp":
            data.currentTP = content.id;
            //sendResponse("Texture Pack successfuly set.");
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
            //sendResponse("Texture Pack successfuly set.");
            data.texturePacks.splice(content.id,1);
            save().then(() => {
                refreshRedirects().then(()=>{
                    sendResponse("Texture Pack successfuly set.");
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
