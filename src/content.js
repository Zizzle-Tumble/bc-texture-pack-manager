var chrome = chrome||browser;
var RESET_ON_RELOAD = true;
var data = {
    currentTP: -1,
    texturePacks: [],
    bc: "https://boxcritters.com/media/31-baseball/",
    from: {
        hamster: "critters/hamster.png",
        snail: "critters/snail.png",
        items: "items/items.png",
        tavenProps: "rooms/HamTavern_SM.png"
    }
}

function getAsserFolderVersion(assetsFolder) {
    var regex = "(https:\/\/boxcritters.com\/media\/)|(-[^]*)";
    var version = assetsFolder.replace(regex,"");
    return version;
}

function getCurrentAssetsFolder() {
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'https://bc-mod-api.herokuapp.com/', true); // Replace 'my_data' with the path to your file
        return new Promise((resolve, reject) => {
            xobj.onreadystatechange = ()=> {
                if (xobj.readyState == 4 && xobj.status == "200") {
                    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                    resolve(JSON.parse(xobj.responseText).assetsFolder);
                }
            };
            xobj.send(null);
        });
}

function addDefault() {
    let tp = {};
    for (key in data.from) {
        tp[key] = data.bc + data.from[key]; // copies each property to the objCopy object
    }
    tp.name = "BoxCritters";
    tp.version = 0;
    data.texturePacks.push(tp);
}

function initDefaultTP() {
    addDefault();
    data.texturePacks.push({
        version: '0',
        name: 'CuteCritters',
        description: 'this texture pack has been in the making for almost 2 days now. it is my attempt to recreate the pink critter. i hope you enjoy. inspired by @Cutiejea\'s profile picture!',
        hamster: 'https://i.imgur.com/IXWBAYU.png',
        snail: 'https://i.imgur.com/WLqEUEy.png',
        items: '',
        tavenProps: ''
      })
}
initDefaultTP();

const resetdata = data;

function refreshRedirects() {
    chrome.runtime.sendMessage({ type: "refreshtp", content: data.currentTP }, console.log);
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
    save();
}

//debugger;
if (RESET_ON_RELOAD) {
    reset();
}
load();


//update assets folder
getCurrentAssetsFolder().then(af=>{
    if(data.bc != af) {
        data.bc = af;
    }
})


chrome.runtime.onMessage.addListener(({ type, content }, sender, sendResponse) => {
    switch (type) {
        case "addtp":
            data.texturePacks.push(content);
            save().then(() => {
                sendResponse("Texture Pack successfuly added.");
            });
            break;
        case "gettexturepacks":
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
                sendResponse("Texture Pack successfuly set.");
            });
            break;
        case "tpexists":
            sendResponse(data.texturePacks.map(tp => tp.name).includes(content));
            break;
        case "reset":
            reset();
            break;
        default:
            sendResponse();
            break;
    }
});
