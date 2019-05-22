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

async function load() {
    var storage = await new Promise((resolve,reject)=>browser.storage.sync.get(["bctpm"],resolve))
    DATA = storage.bctpm || DATA;
    if (RESETDATA.bc !== DATA.bc) {
        DATA.bc = RESETDATA.bc;
    }
    var proms = DATA.texturePacks.map(async tp => {
        if (tp.new === undefined) {
            tp.new = true;
            return;
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

    });

    DATA.texturePacks = await Promise.all(proms);
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




MSG_LISTENER.addListener("addtp", (content, sendResponse) => {
    content.new = true;
    var id = DATA.texturePacks.push(content) - 1;
    save().then(() => {
        //browser.browserAction.setBadgeText({ text: data.texturePacks.length });
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
    DATA.currentTP = content.id;
    save().then(() => {
        genrules().then(() => {
            sendResponse("Texture Pack successfuly set.");
        });
    });
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