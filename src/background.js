var chrome = chrome||browser;
var rules = new Array();

function sendMessage(type,content,response) {
    console.log("Sending message:",{type,content});
    chrome.tabs.query({currentWindow:true,active:true},
        (tabs)=>{
            chrome.tabs.sendMessage(tabs[0].id,{type,content},response);
        }
    );
}

function load() {
    return new Promise((resolve,reject)=>{
        chrome.storage.sync.get(["bctpm"],(storage)=>{
            resolve(storage.bctpm);
        });
    });
}




function saverules() {
    return new Promise((resolve,reject)=>{
        genrules().then((rules)=>{
            chrome.storage.sync.set({'bctpmRules':rules},resolve);
        })
    });
}

function loadrules() {
    return new Promise((resolve,reject)=>{
        chrome.storage.sync.get(["bctpmRules"],(storage)=>{
            rules = storage.bctpmRules || [];
            resolve(storage.bctpmRules);
        });
    });
}

async function loadImage(img) {
    if(img.startsWith('https://boxcritters.com')) {
        return img;
    }
    var api = "https://bc-mod-api.herokuapp.com/cors/data/";
    var url = api + img;

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true); // Replace 'my_data' with the path to your file

    return await new Promise((resolve, reject) => {
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                resolve(JSON.parse(xobj.responseText).url);
            }
        };
        xobj.send(null);
    });
    /*return await new Promise((resolve,reject)=>{
        var canvas = document.createElement("canvas");
        var img = new Image();
        img.origin = 'anonymous';
        img.crossOrigin = "Anonymous";
        img.addEventListener("load", ()=> {
            canvas.getContext("2d").drawImage(img, 0, 0);
            //resolve({data: canvas.toDataURL()});
            console.log(canvas.toDataURL("image/png"));
            
            
            resolve(canvas.toDataURL())
        });
        img.src = url;
    })*/
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function genrules() {
    return new Promise((resolve,reject)=>{
        load().then((data)=>{
            if(data===undefined || data === {}){
                reject("no data was found");
                return;
            }

            //get current texture pack
            if(data.currentTP<0){
                reject("no texture pack was selected");
                return;
            }
            var currentTP = data.texturePacks[data.currentTP];
            console.log("current tp",data.currentTP);

            //Get Deafult texture pack
            var defaultTP = clone(data.from)
            var keys = Object.keys(defaultTP);
            keys.map(function(key) {
                defaultTP[key] = data.bc + defaultTP[key];
            });

            //get texture pack attributes
            keys = Object.keys(defaultTP);
            if(keys.length==0){
                resject("texture pack has no attributes");
                return;
            }
            console.log("keys",keys);
            /*rules = keys.reduce((result,key)=>{
                console.log(key);
                console.log(typeof result !== "object")
                console.log(result);


                if(typeof result !== "object") {
                    result = {};
                }
                if(currentTP[key] !== ""){
                    result[key] = {from:defaultTP[key],to:currentTP[key]||defaultTP[key]};
                }
                return result;
            });*/
            rules = keys.map((key)=>{
                var rule = {};

                console.log("key",key);
                

                rule.from = defaultTP[key];
                rule.to = currentTP[key]||defaultTP[key];
                console.log("rule",rule);
                return rule;
            });
            rules = rules.filter(r=>r.to!==r.from);
            rules = rules.map(async r=>{
                    r.to = await loadImage(r.to);
                    return r;
            });
            Promise.all(rules).then(arr=>{
                rules = arr;
                console.log("rules",rules);
            })
            resolve(rules);
        }).catch(reject);
        //resolve([{from:"https://boxcritters.com/media/31-baseball/critters/hamster.png",to:"https://i.imgur.com/IXWBAYU.png"}])
    });
}

genrules().catch(console.error);
/*saverules().then(()=>{
    loadrules();
});
loadrules();*/

var lastRequestId;
async function redirect(request) {
    //console.log("\n\n")
    console.log("REQUEST",request.url);
    //console.log("rules",rules);

    var rule = rules.find((rule)=>{
        console.log("DOES ==",rule.from," ???");
        return request.url == rule.from
        && request.requestId !== lastRequestId;
    });



    if(rule){
        //console.log("rule",rule);
        console.log("Redirecting to ",{data:rule.to});

        lastRequestId = request.requestId;
        
        return {
            //redirectUrl : request.url.replace(rule.from, rule.to)
            redirectUrl: rule.to
        };
    }
}

chrome.runtime.onMessage.addListener(({type,content}, sender, sendResponse)=> {
    switch (type) {
        case "refreshtp":
            genrules().then(()=>{
                sendResponse()
                console.log("pack set to",content);
            }).catch(sendResponse);
            break;
        default:
            break;
    }

    sendResponse();
});

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        return redirect(details);
    },
    {
        urls : ["https://boxcritters.com/media/*"]
    },
    ["blocking"]
);
