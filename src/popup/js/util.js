//@ts-check
//@ts-ignore
var chrome = chrome || browser;
var NAV = document.getElementById('nav');
var NAVTEXT = NAV.innerHTML;

/**
 * 
 * @param {string} url 
 */
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

function getFormats() {
    return getJSON('/formats.json');

}

/**
 * 
 * @param {Event} e 
 */
function noRedirectForm(e) {
    e.preventDefault();
}

/**
 * 
 * @param {string} type 
 * @param {object} content 
 * @returns {Promise}
 */
function sendMessage(type, content={}) {
    console.log("Sending message:", { type, content });

    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, active: true },
            (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type, content }, resolve);
            }
        );
    });
}

function findTabWithURl(url) {
    console.log("Finding tab with url:", url);

    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, url:url },
            (tabs) => {
                resolve(tabs[0]);
            }
        );
    });
}

function refreshNav() {
    sendMessage("ping")
    .then((pong=false)=>{
    if(pong){
        NAV.innerHTML = NAVTEXT;
    } else {
        NAV.innerHTML = "";
    }
    });
}
refreshNav();