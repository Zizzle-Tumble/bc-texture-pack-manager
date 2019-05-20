//@ts-check
var browser = browser || chrome || msBrowser;

function sendMessageBG(type, content) {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage({ type, content }, resolve);
    })
}

console.log("FOUND THEME FILE");

var tpdata = JSON.parse(document.body.innerText);
tpdata.source = document.URL
console.log(tpdata);
var tpencoded = btoa(JSON.stringify(tpdata))

var newURL = browser.extension.getURL('popup/addtheme.html') + "?data=" + tpencoded;
console.log(newURL);

//window.location.href = newURL;
sendMessageBG("createtab",{ url: newURL});