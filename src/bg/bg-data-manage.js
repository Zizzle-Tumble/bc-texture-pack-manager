var browser = browser || chrome || msBrowser;

function getJSON(url) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true); // Replace 'my_data' with the path to your file
    return new Promise((resolve, reject) => {
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == 200) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                resolve(JSON.parse(xobj.responseText));
            }
        };
        xobj.send(null);
    });
}

function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    /*if (aProps.length != bProps.length) {
        return false;
    }*/

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

function updateBadge() {
    if(DATA.currentTP.length>0){
        browser.browserAction.setBadgeText({ text: DATA.currentTP.length.toString() });
    } else {
        browser.browserAction.setBadgeText({ text: "" });
    }
}

function save() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.set({ 'bctpm': DATA }, resolve);
    });
    updateBadge();
}

async function load() {
    var storage = await new Promise((resolve,reject)=>browser.storage.sync.get(["bctpm"],resolve))
    DATA = storage.bctpm || DATA;
    if (RESETDATA.bc !== DATA.bc) {
        DATA.bc = RESETDATA.bc;
    }
    if(!Array.isArray(DATA.currentTP)) {
        var currentTP = DATA.currentTP;
        DATA.currentTP = [];
        if(DATA.currentTP !== -1) {
            DATA.currentTP.unshift(currentTP);
        }
    }
    var proms = DATA.texturePacks.map(async tp => {
        if (tp.new === undefined) {
            tp.new = true;
            return tp;
        }

        //UPDATE TEXTURE PACKS
        if (tp.updateURL) {
            var newtp = await getJSON(tp.updateURL);
            if (!isEquivalent(tp, newtp)) {
                newtp.new = true;
                newtp.updateURL = tp.updateURL;
                return newtp;
            }

        }
        return tp;
    });

    DATA.texturePacks = await Promise.all(proms);
    updateBadge();
    return DATA;
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


MSG_LISTENER.addListener("refreshtp",(content,sendResponse)=>{
    
    load().then(()=>{
        genrules().then(() => {
            sendResponse("done");
        });
    });
})

MSG_LISTENER.addListener("addtp", (content, sendResponse) => {
    content.new = true;
    var id = DATA.texturePacks.push(content) - 1;
    save().then(() => {
        updateBadge();
        sendResponse("Texture Pack successfuly added.");
    });
});
MSG_LISTENER.addListener("gettp", (content, sendResponse) => {
    sendResponse(DATA.texturePacks);
});
MSG_LISTENER.addListener("getdata", (content, sendResponse) => {
    sendResponse(DATA);
});

MSG_LISTENER.addListener("settp", (content, sendResponse) => {
    if(DATA.currentTP.includes(content.id)) {
        DATA.currentTP.splice( DATA.currentTP.indexOf(content.id), 1 );
    } else {
        DATA.currentTP.unshift(content.id);
    }
    save().then(() => {
        genrules().then(() => {
            sendResponse("Texture Pack successfuly set.");
        });
    });
    updateBadge()
});
MSG_LISTENER.addListener("deletetp", (content, sendResponse) => {
    if (DATA.currentTP === content.id) {
        DATA.currentTP = -1;
    }
    DATA.texturePacks.splice(content.id, 1);
    save().then(() => {
        genrules().then(() => {
            sendResponse("Texture Pack successfuly deleted.");
        });
    });
});
MSG_LISTENER.addListener("tpexists", (content, sendResponse) => {
    sendResponse(DATA.texturePacks.map(tp => tp.name).includes(content));
});
MSG_LISTENER.addListener("reset", (content, sendResponse) => {
    reset().then(() => {
        genrules().then(() => {
            sendResponse("reset");
        });
    });
});