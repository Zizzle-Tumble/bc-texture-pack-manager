//@ts-check
var browser = browser || chrome || msBrowser;
var rules = new Array();

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

async function getFormats() {
    return getJSON('/formats.json');
}

function getCurrentVersionInfo() {
    return getJSON('https://bc-mod-api.herokuapp.com/');
}

async function getCurrentAssetsFolder() {
    return (await getCurrentVersionInfo()).assetsFolder;
}

async function getDefaultTP() {
    var formats = await getFormats();
    var defaultTP = formats.texturePack[formats.texturePack.length - 1].reduce((obj, tp) => {
        if (!tp.default) {
            return obj;
        }
        obj[tp.name] = tp.default;
        return obj
    }, {})
    var v = await getCurrentVersionInfo();
    defaultTP.script = `https://boxcritters.com/scripts/client${v.version}.min.js`
    return defaultTP
}

function sendMessage(type, content) {
    console.log("Sending message:", { type, content });
    return new Promise((resolve, reject) => {
        browser.tabs.query({ currentWindow: true, active: true },
            (tabs) => {
                browser.tabs.sendMessage(tabs[0].id, { type, content }, resolve);
            }
        );
    });
}

function load() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get(["bctpm"], (storage) => {
            if(storage.bctpm){
            browser.browserAction.setBadgeText({ text: storage.bctpm.texturePacks.length.toString() });
            }
            resolve(storage.bctpm);
        });
    });
}




function saverules() {
    return new Promise((resolve, reject) => {
        genrules().then((rules) => {
            browser.storage.sync.set({ 'bctpmRules': rules }, resolve);
        })
    });
}

function loadrules() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get(["bctpmRules"], (storage) => {
            rules = storage.bctpmRules || [];
            resolve(storage.bctpmRules);
        });
    });
}

async function loadImage(img) {
    if (img.startsWith('https://boxcritters.com')) {
        return img;
    }
    var api = "https://bc-mod-api.herokuapp.com/cors/data/";
    var url = api + img;

    return (await getJSON(url)).url
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

async function genrules() {
    //Get Default texture pack
    var defaultTP = await getDefaultTP();
    var bc = (await getCurrentVersionInfo()).assetsFolder;

    return new Promise((resolve, reject) => {

        load().then((data) => {
            if (data === undefined || data === {}) {
                reject("no data was found");
                return;
            }

            //get current texture pack
            if (data.currentTP < 0) {
                rules = [];
                resolve("no texture pack was selected");
            }
            var currentTP = data.texturePacks[data.currentTP] || {};
            console.log("current tp", data.currentTP);

            var keys = Object.keys(defaultTP);
            keys.map(function (key) {
                if (!defaultTP[key].startsWith("http")) {
                    defaultTP[key] = bc + defaultTP[key];
                }
            });

            //get texture pack attributes
            keys = Object.keys(defaultTP);
            if (keys.length == 0) {
                reject("texture pack has no attributes");
            }
            //console.log("keys",keys);
            rules = keys.map((key) => {
                var rule = {};
                //console.log("key",key);


                rule.from = defaultTP[key];
                rule.to = currentTP[key] || defaultTP[key];
                //console.log("rule",rule);
                return rule;
            });

            rules = rules.filter(r => r.to !== r.from);
            rules = rules.map(async r => {
                if (r.from.endsWith(".png")) {
                    r.to = await loadImage(r.to);
                }
                return r;
            });
            Promise.all(rules).then(arr => {
                rules = arr;
                console.log("rules", rules);
                resolve(rules);
            })
        }).catch(reject);
    });
}

genrules().catch(console.error);

var lastRequestId;
function redirect(request) {
    //console.log("\n\n")
    //console.log("rules",rules);

    var rule = rules.find((rule) => {
        //console.log("DOES ==",rule.from," ???");
        return request.url == rule.from
            && request.requestId !== lastRequestId;
    });

    if (!rule) {
        return;
    }
    console.log("REQUEST", request.url);



    if (rule) {
        //console.log("rule",rule);
        console.log("THEN GO", { data: rule.to })
        //console.log("Redirecting... ");

        lastRequestId = request.requestId;

        return {
            //redirectUrl : request.url.replace(rule.from, rule.to)
            redirectUrl: rule.to
        };
    }
}

browser.runtime.onMessage.addListener(({ type, content }, sender, sendResponse) => {
    switch (type) {
        case "refreshtp":
            genrules().then(() => {
                console.log("pack set to", content);
                sendResponse();
            }).catch(sendResponse);
            break;
        case "createtab":
            //browser.tabs.query({ currentWindow: true, active: true }, tabs => {
                browser.tabs.update(sender.tab.id, content), sendResponse;
            //})
            break;
        default:
            break;
    }

    sendResponse();
});

browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        return redirect(details);
    },
    {
        urls: ["https://boxcritters.com/*"],
        //types: ["image"]
    },
    ["blocking"]
);
