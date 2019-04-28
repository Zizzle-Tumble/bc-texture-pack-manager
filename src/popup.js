var chrome = chrome||browser;
document.addEventListener('DOMContentLoaded', () => {
    var addtpbutton = document.querySelector("button#addtheme");
    var tplist = document.querySelector("ul#tplist")
    var createtpform = document.querySelector("form#createtpform")

    function isNullOrUndefined(obj) {
        return obj === null ||
            obj === undefined
    }

    function encode(text) {
        return btoa(JSON.stringify(text));
    }

    function decode(text) {
        return JSON.parse(atob(text));
    }

    function getFormats() {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'formats.json', true); // Replace 'my_data' with the path to your file
        return new Promise((resolve, reject) => {
            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == "200") {
                    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                    resolve(JSON.parse(xobj.responseText));
                }
            };
            xobj.send(null);
        });
    }

    function sendMessage(type, content, response) {
        console.log("Sending message:", { type, content });
        chrome.tabs.query({ currentWindow: true, active: true },
            (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type, content }, response);
            }
        );
    }

    function sendMessageBG(type,content,response) {
        chrome.runtime.sendMessage({type,content}, response);
    }

    function refreshPage() {
        chrome.tabs.reload();
    }

    function valid(type, obj) {
        return new Promise((resolve, reject) => {
            var keys = Object.keys(obj);
            if (!keys.includes("version")) {
                resolve(false);
            }
            getFormats().then(formats => {
                //reject(JSON.stringify(formats, undefined, 2))
                formats = formats[type][obj.version];
                var valid = formats.every(i => keys.indexOf(i.name) > -1 || !i.required);
                resolve(valid);
            }).catch(reject)

        });

    }

    function createTP() {
        var textarea = document.querySelector('textarea');
        var formData = new FormData(createtpform);
        var data = {};
        formData.forEach(function(value, key){
            data[key] = value;
        });
        textarea.value = encode(data);
        return false;
    }

    function AddTP(data) {
        return new Promise((resolve, reject) => {
            data = decode(data);
            valid("texturePack", data).then((valid) => {
                sendMessage("tpexists",data.name,(exists)=>{
                    if(exists){
                        reject("Texture pack exists");
                    }

                    if (valid) {
                        sendMessage("addtp", data, (msg) => {
                            resolve(msg);
                            setTimeout(() => {
                                window.location.href = "popup.html";
                            }, 500)
                        });
                    }
                    else {
                        reject("Invalid Texture Pack Format");
                    }
                });
            }).catch(reject);
        })
    }

    function enableTP(id){
        console.log("hello")
        var errormessage = document.getElementById('error');
        var successmessage = document.getElementById('success');
        sendMessage("settp",{id},(msg)=>{
            sendMessageBG('refreshtp',id,console.log);
            refreshPage();
            successmessage.style.display = "block";
            errormessage.innerHTML = msg;
            setTimeout(()=>{
                successmessage.style.display = "none";
            },500)
        });
    }

    //Add Texture Pack Button
    if (!isNullOrUndefined(addtpbutton)) {
        addtpbutton.addEventListener('click', () => {
            var textarea = document.querySelector('textarea');
            var errormessage = document.getElementById('error');
            var successmessage = document.getElementById('success');
            AddTP(textarea.value).then((msg) => {
                successmessage.style.display = "block";
                successmessage.innerHTML = msg;
            }).catch((msg) => {
                errormessage.style.display = "block";
                errormessage.innerHTML = msg;
            })
        }, false);
    }

    //List Texture Packs
    if (!isNullOrUndefined(tplist)) {
        sendMessage("gettexturepacks", {}, (texturepacks) => {
            tplist.innerHTML = "";
            if (isNullOrUndefined(texturepacks)) {
                tplist.innerHTML = 'Please enter Box Critters.';
                return;
            }
            if (texturepacks instanceof Array && texturepacks.length === 0) {
                tplist.innerHTML = 'There are no themes. Please <a href="addtheme.html">add a theme</a>.';
                return;
            }
            texturepacks.forEach((tp,i)=>{
                var tpitem = document.createElement('li');
                var tpitemlink = document.createElement('a');
                tpitemlink.href = "#";
                tpitemlink.addEventListener('click',()=>{
                    enableTP(i);
                });
                tpitemlink.innerHTML = tp.name;
                tpitem.appendChild(tpitemlink);
                tplist.appendChild(tpitem);
            });
        });
    }

    function getVersionIndicator(v) {
        var verinput = document.createElement('input');
        verinput.type = "hidden";
        verinput.name = "version";
        verinput.value = v;
        return verinput;
    }

    //Create Texture Psck Form
    if (!isNullOrUndefined(createtpform)) {
        getFormats().then(formats => {
            var currentVersion = formats.texturePack.length - 1;
            createtpform.appendChild(getVersionIndicator(currentVersion))
            formats = formats.texturePack[currentVersion];
            formats.forEach(f => {
                if (f.hidden) {
                    return;
                }
                var formItem = document.createElement('div');
                var formItemLabel = document.createElement('span');
                var formItemValue = document.createElement('input');

                formItemLabel.innerHTML = f.label;
                formItemValue.name = f.name;
                formItemValue.classList = "form-control px-2"

                formItem.appendChild(formItemLabel);
                formItem.appendChild(formItemValue);
                createtpform.appendChild(formItem);
            });
            var button = document.createElement('button');
			button.classList = "btn btn-primary"
			button.attributeName = "style.css"
            button.innerHTML = "Create Texture Pack";
            button.type = "submit";
            createtpform.appendChild(button);

            createtpform.addEventListener('submit', (e) => {
                event.preventDefault();
                createTP(e);
            });
        });
    }

}, false);