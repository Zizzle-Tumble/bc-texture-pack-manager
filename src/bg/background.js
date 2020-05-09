//@ts-check
var browser = browser || chrome || msBrowser;
var TP_RULES = new Array();
var DEFAULT_TP;

var api = "https://api.boxcrittersmods.ga";

// async function getFormats() {
//     var formats = await getJSON('/formats.json');
//     formats.texturePack.push(await getJSON('https://bc-mod-api.herokuapp.com/texture-data/'));
//     return formats;

// }


function getSites() {
    return getJSON(api + '/sites');
}

function getCurrentVersionInfo() {
    return getJSON(api + '/versions/latest');
}

async function getDefaultTP() {
	if(!DEFAULT_TP) DEFAULT_TP = await getJSON(api+'/textures/BoxCritters.bctp.json');
	return DEFAULT_TP;
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


MSG_LISTENER.addListener("getrules", (content, sendResponse) => {
    sendResponse(TP_RULES);
});


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
            TP_RULES = storage.bctpmRules || [];
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
async function loadFile(file) {
    if (file.startsWith('https://boxcritters.com')) {
        return file;
    }
    var api = "https://bc-mod-api.herokuapp.com/cors/file/";
    var url = api + file;

    return url;
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
    var verInfo = await getCurrentVersionInfo();
    var defaultTP = await getDefaultTP();
    var bcVersionFolder = verInfo.assetsFolder;

    var keys = Object.keys(defaultTP);

    //get texture pack attributes
    keys = Object.keys(defaultTP);
    if (keys.length == 0) {
        throw "texture pack has no attributes";
    }

    if (DATA === undefined ) {
        return "no data was found";
    }
    TP_RULES = [];

    //get current texture pacK
    if (DATA.currentTP.length < 1) {
        return "no texture pack was selected";
	}
    DATA.currentTP.forEach(ctp=>{
		var currentTP = DATA.texturePacks[ctp] || {};
		currentTP.new = false;
		currentTP = Object.assign({},currentTP);
		
		["name","author","date","description","version","packVersion","new","updateURL"].forEach(k=>{
			delete currentTP[k];
		})
        console.log("current tp", ctp);

        var tpRules = keys.map((key) => {
			
            var rule = {};
            //console.log("key",key);
    
    
            rule.from = defaultTP[key];
            rule.to = currentTP[key] || defaultTP[key];
            //console.log("rule",rule);
            return rule;
        });        

        tpRules = tpRules.filter(r => 
            r.to !== r.from &&
            !TP_RULES.map(rule=>rule.from).includes(r.from)
        );

        TP_RULES.push(...tpRules);

    });

    var rulesProm = []

    rulesProm = TP_RULES.map(async r => {
        if (r.from.endsWith(".png")) {
            r.to = await loadImage(r.to);
        } else {
            r.to = await loadFile(r.to);
        }
        return r;
    });
    TP_RULES = await Promise.all(rulesProm);
    console.log("rules", TP_RULES);
}
load().then(()=>{
    genrules().catch(console.error);
})

var lastRequestId;
function redirect(request) {
    //console.log("\n\n")
    //console.log("rules",rules);

    var rule = TP_RULES.find((rule) => {
        console.log("DOES ",request.url," == ",rule.from," ???");
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
		urls: ["https://*.boxcritters.com/*","https://critterball.herokuapp.com/*"],
        //types: ["image"]
    },
    ["blocking"]
);


