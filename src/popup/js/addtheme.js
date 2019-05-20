//@ts-check
var addtpbutton = document.querySelector("button#addtheme");
/**
 * @type {HTMLTextAreaElement}
 */
var textarea = document.querySelector('textarea#tpdata');
textarea.style.width = "100%";

var addtpfrom = document.querySelector("form#addtpform");
addtpfrom.addEventListener('submit',noRedirectForm);

async function valid(type, obj) {
        var keys = Object.keys(obj);
        if (!keys.includes("version")) {
            return false;
        }
        
    return new Promise((resolve, reject) => {
        getFormats()
            .then(formats => {
                //reject(JSON.stringify(formats, undefined, 2))
                formats = formats[type][obj.version];
                var valid = formats.every(i => keys.indexOf(i.name) > -1 || !i.required);
                resolve(valid);
            }).catch(reject)

    });

}
function AddTP(data) {
    console.log("addtp");
    
    return new Promise((resolve, reject) => {
        data = decode(data);
        valid("texturePack", data).then((valid) => {
            sendMessageBG("tpexists", data.name)
                .then(exists => {
                    if (exists) {
                        console.log("exists");
                        
                        reject("Texture pack exists");
                        return;
                    } else if (valid) {
                        console.log("valid");
                        
                        sendMessageBG("addtp", data).then(resolve);
                        return;
                    }
                    else {
                        console.log("ivalid");                        
                        reject("Invalid Texture Pack Format");
                    }
                });
        }).catch(reject);
    })
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

if(getURLParams().data) {
    textarea.value = getURLParams().data;
    addtpbutton.click();
}