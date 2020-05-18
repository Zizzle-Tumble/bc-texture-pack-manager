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

console.log("FOUND SHADER FILE");

var shaderdata = JSON.parse(document.body.innerText);
shaderdata.updateURL = document.URL;
console.log(shaderdata);
var shaderencoded = btoa(JSON.stringify(cleanEmpty(shaderdata)));

var newURL = browser.extension.getURL('popup/addshader.html') + "?data=" + shaderencoded;
console.log(newURL);

//window.location.href = newURL;
sendMessageBG("createtab",{ url: newURL});