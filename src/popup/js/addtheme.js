//@ts-check
var addtpbutton = document.querySelector("button#addtheme");
/**
 * @type {HTMLTextAreaElement}
 */
var textarea = document.querySelector('textarea#tpdata');
textarea.style.width = "100%";

var addtpfrom = document.querySelector("form#addtpform");
addtpfrom.addEventListener('submit', noRedirectForm);

async function isValidFormatting(type, obj) {
    var keys = Object.keys(obj);
    if (!keys.includes("version")) {
        return false;
    }
    var formats = await getFormats()
    // throw JSON.stringify(formats, undefined, 2);
    formats = formats[type][obj.version];
    var valid = formats.every(i => keys.indexOf(i.name) > -1 || !i.required);
    return valid;

}

async function AddTP(data) {
    console.log("addtp");
    data = decode(data);
    debugger
    var valid = await isValidFormatting("texturePack", data);
    var exists = await sendMessageBG("tpexists", data.name);
    if (exists) {
        console.log("exists");

        throw "Texture pack exists";
        return;
    } else if (valid) {
        console.log("valid");

        return await sendMessageBG("addtp", data);
        //return;
    }
    else {
        console.log("invalid");
        throw "Invalid Texture Pack Format";
    }
}

//Add Texture Pack Button
addtpbutton.addEventListener('click', () => {
    var errormessage = document.getElementById('error');
    var successmessage = document.getElementById('success');
    AddTP(textarea.value)
        .then((msg) => {
            successmessage.style.display = "block";
            successmessage.innerHTML = msg;
            setTimeout(() => {
                //window.location.href = "popup.html";
                window.close();
            }, 500)
        }).catch((msg) => {
            errormessage.style.display = "block";
            errormessage.innerHTML = msg;
        })
}, false);

if (getURLParams().data) {
    textarea.value = getURLParams().data;
    textarea.setAttribute("readonly", "");
    //addtpbutton.click();
}