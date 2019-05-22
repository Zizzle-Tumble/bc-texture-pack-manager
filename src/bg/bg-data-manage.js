var browser = browser || chrome || msBrowser;
function getAsserFolderVersion(assetsFolder) {
    var regex = "(https:\/\/boxcritters.com\/media\/)|(-[^]*)";
    var version = assetsFolder.replace(regex, "");
    return version;
}


function save() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.set({ 'bctpm': DATA }, resolve);
    });
}

function load() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get(["bctpm"], (storage) => {
            DATA = storage.bctpm || DATA;
            if (RESETDATA.bc !== DATA.bc) {
                DATA.bc = RESETDATA.bc;
            }
            DATA.texturePacks.forEach(tp=>{
                if(tp.new === undefined) {
                    tp.new = true;
                }
            })
            resolve(DATA);
        });
    });
}

function reset() {
    DATA = RESETDATA;
    return save();
}

//debugger;
if (RESET_ON_RELOAD) {
    reset();
}
load();




MSG_LISTENER.addListener("addtp",(content,sendResponse)=>{
    content.new = true;
    var id = DATA.texturePacks.push(content)-1;
    save().then(() => {
        //browser.browserAction.setBadgeText({ text: data.texturePacks.length });
        sendResponse("Texture Pack successfuly added.");
    });
});
MSG_LISTENER.addListener("gettp",(content,sendResponse)=>{
    sendResponse(DATA.texturePacks);
});
MSG_LISTENER.addListener("getdata",(content,sendResponse)=>{
    sendResponse(DATA);
});
MSG_LISTENER.addListener("settp",(content,sendResponse)=>{
    DATA.currentTP = content.id;
    save().then(() => {
        genrules().then(()=>{
            sendResponse("Texture Pack successfuly set.");
        });
    });
});
MSG_LISTENER.addListener("deletetp",(content,sendResponse)=>{
    if(DATA.currentTP === content.id){
        DATA.currentTP = -1;
    }
    DATA.texturePacks.splice(content.id,1);
    save().then(() => {
        genrules().then(()=>{
            sendResponse("Texture Pack successfuly deleted.");
        });
    });
});
MSG_LISTENER.addListener("tpexists",(content,sendResponse)=>{
    sendResponse(DATA.texturePacks.map(tp => tp.name).includes(content));
});
MSG_LISTENER.addListener("reset",(content,sendResponse)=>{
    reset().then(() => {
        genrules().then(()=>{
            sendResponse("reset");
        });
    });
});