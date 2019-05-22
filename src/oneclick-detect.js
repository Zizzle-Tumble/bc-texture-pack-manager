//@ts-check
var browser = browser || chrome || msBrowser;

function cleanEmpty(obj) {
    Object.keys(obj).forEach(key => obj[key] === undefined||obj[key] === "" ? delete obj[key] : '');
    return obj;
}

function sendMessageBG(type, content) {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage({ type, content }, resolve);
    })
}

console.log("FOUND THEME FILE");

var tpdata = JSON.parse(document.body.innerText);
tpdata.updateURL = document.URL;
console.log(tpdata);
var tpencoded = btoa(JSON.stringify(cleanEmpty(tpdata)));

var newURL = browser.extension.getURL('popup/addtheme.html') + "?data=" + tpencoded;
console.log(newURL);

//window.location.href = newURL;
sendMessageBG("createtab",{ url: newURL});