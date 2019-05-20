var browser = browser || chrome || msBrowser;
function getAsserFolderVersion(assetsFolder) {
    var regex = "(https:\/\/boxcritters.com\/media\/)|(-[^]*)";
    var version = assetsFolder.replace(regex, "");
    return version;
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




MSG_LISTENER.addListener("addtp",(content,sendResponse)=>{
    var id = data.texturePacks.push(content)-1;
    data.currentTP = id;
    save().then(() => {
        //browser.browserAction.setBadgeText({ text: data.texturePacks.length });
        sendResponse("Texture Pack successfuly added.");
    });
});
MSG_LISTENER.addListener("gettp",(content,sendResponse)=>{
    sendResponse(data.texturePacks);
});
MSG_LISTENER.addListener("getdata",(content,sendResponse)=>{
    sendResponse(data);
});
MSG_LISTENER.addListener("settp",(content,sendResponse)=>{
    data.currentTP = content.id;
    save().then(() => {
        refreshRedirects().then(()=>{
            sendResponse("Texture Pack successfuly set.");
        });
    });
});
MSG_LISTENER.addListener("deletetp",(content,sendResponse)=>{
    if(data.currentTP === content.id){
        data.currentTP = -1;
    }
    data.texturePacks.splice(content.id,1);
    save().then(() => {
        refreshRedirects().then(()=>{
            sendResponse("Texture Pack successfuly deleted.");
        });
    });
});
MSG_LISTENER.addListener("tpexists",(content,sendResponse)=>{
    sendResponse(data.texturePacks.map(tp => tp.name).includes(content));
});
MSG_LISTENER.addListener("reset",(content,sendResponse)=>{
    reset().then(() => {
        refreshRedirects().then(()=>{
            sendResponse("reset");
        });
    });
});