//@ts-check
var browser = browser || chrome || msBrowser;
var RULES = new Array();

async function getFormats() {
    var formats = await getJSON('/formats.json');
    formats.texturePack.push(await getJSON('https://bc-mod-api.herokuapp.com/texture-data/'));
    return formats;

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
    defaultTP.script = `/scripts/client${v.version}.min.js`
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
            RULES = storage.bctpmRules || [];
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
    var bc = "https://boxcritters.com/media";
    var bcv = (await getCurrentVersionInfo()).assetsFolder;

    if (DATA === undefined ) {
        return "no data was found";
    }

    //get current texture pack
    if (DATA.currentTP < 0) {
        RULES = [];
        return "no texture pack was selected";
    }
    var currentTP = DATA.texturePacks[DATA.currentTP] || {};
    currentTP.new = false;
    console.log("current tp", DATA.currentTP);

    var keys = Object.keys(defaultTP);
    keys.map(function (key) {
        if (!defaultTP[key].startsWith("http")) {
            if(defaultTP[key].startsWith("/")) {
                defaultTP[key] = bc + defaultTP[key];
            } else {
                defaultTP[key] = bcv + defaultTP[key];
            }
        }
    });

    //get texture pack attributes
    keys = Object.keys(defaultTP);
    if (keys.length == 0) {
        throw "texture pack has no attributes";
    }
    //console.log("keys",keys);
    RULES = keys.map((key) => {
        var rule = {};
        //console.log("key",key);


        rule.from = defaultTP[key];
        rule.to = currentTP[key] || defaultTP[key];
        //console.log("rule",rule);
        return rule;
    });

    RULES = RULES.filter(r => r.to !== r.from);
    RULES = RULES.map(async r => {
        if (r.from.endsWith(".png")) {
            r.to = await loadImage(r.to);
        }
        return r;
    });
    RULES = await Promise.all(RULES);
    console.log("rules", RULES);
}
load().then(()=>{
    genrules().catch(console.error);
})

var lastRequestId;
function redirect(request) {
    //console.log("\n\n")
    //console.log("rules",rules);

    var rule = RULES.find((rule) => {
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

MSG_LISTENER.addListener("refreshrules",(content,sendResponse)=>{
    genrules().then(() => {
        console.log("pack set to", content);
        sendResponse();
    }).catch(sendResponse);
});
MSG_LISTENER.addListener("createtab",(content,sendResponse,sender)=>{
    //browser.tabs.query({ currentWindow: true, active: true }, tabs => {
        browser.tabs.update(sender.tab.id, content), sendResponse;
    //})
});

MSG_LISTENER.start();

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


