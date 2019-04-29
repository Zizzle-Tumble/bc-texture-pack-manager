//@ts-check
// @ts-ignore
var chrome = chrome||browser;
document.addEventListener('DOMContentLoaded', () => {
    var addtpbutton = document.querySelector("button#addtheme");
    var tplist = document.querySelector("div#tplist")
    /**
     * @type HTMLFormElement
     */
    var createtpform = document.querySelector("form#createtpform")
    var resetbutton = document.querySelector('button#reset');

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
                if (xobj.readyState == 4 && xobj.status == 200) {
                    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                    resolve(JSON.parse(xobj.responseText));
                }
            };
            xobj.send(null);
        });
    }

    function sendMessageCB(type, content, response) {
        console.log("Sending message:", { type, content });

        return new Promise((resolve,reject)=>{
            chrome.tabs.query({ currentWindow: true, active: true },
                (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { type, content }).then(resolve).catch(reject);
                }
            );
        })
       
    }

    function sendMessageCB(type, content, response) {
        console.log("Sending message:", { type, content });
        chrome.tabs.query({ currentWindow: true, active: true },
            (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type, content }, response);
            }
        );
    }



    function sendMessageBG(type,content) {
        return chrome.runtime.sendMessage({type,content});
    }

    function refreshPage() {
        location.reload();
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
                sendMessageCB("tpexists",data.name,(exists)=>{
                    if(exists){
                        reject("Texture pack exists");
                    }

                    if (valid) {
                        sendMessageCB("addtp", data, (msg) => {
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
        var errormessage = document.getElementById('error');
        var successmessage = document.getElementById('success');
        sendMessageCB("settp",{id},(msg)=>{
            sendMessageBG('refreshtp',id).then(console.log);
            refreshPage();
            successmessage.style.display = "block";
            errormessage.innerHTML = msg;
            setTimeout(()=>{
                successmessage.style.display = "none";
            },500)
        });
    }

    function getDefault(data) {
        let tp = {};
        for (var key in data.from) {
            tp[key] = data.bc + data.from[key]; // copies each property to the objCopy object
        }
        tp.name = "BoxCritters";

        var des = [
            //Description by Eribetra
            "The default, vanilla texture pack.",
            //Description by Blackout03
            "Wanna go retro? Use this pack!"
        ]

        tp.description = des[Math.round(Math.random()*des.length)];
        tp.version = 0;
        return tp;
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
    /*
    <a href="#" class="list-group-item list-group-item-action flex-column align-items-start active">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">List group item heading</h5>
            <small>3 days ago</small>
        </div>
        <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
        <small>Donec id elit non mi porta.</small>
        <span class="pull-right button-group">
        <a href="/admin/userA" class="btn btn-primary"><span class="glyphicon glyphicon-edit"></span> Edit</a> 
        <button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span> Delete</button>
        </span>
    </a>
    */

    function genTPItem(tp) {
        //link
        var link = document.createElement('a');
        link.classList.add("list-group-item list-group-item d-flex flex-row justify-content-between align-items-center");
        link.href = "#";
        //left
        var left = document.createElement("span");
        //header
        var header = document.createElement('div');
        header.classList.add("d-flex w-100 justify-content-between");
        //title
        var title = document.createElement('h5');
        title.classList.add("mb-1");
        title.innerHTML = tp.name;
        header.appendChild(title);
        //date created

        //description
        if(tp.description) {
            var description = document.createElement('p');
            description.classList.add("mb-1");
            description.innerHTML = tp.description;
        }
        //author


        
        left.appendChild(header);
        if(description) {
            left.appendChild(description);
        }
        link.appendChild(left);

         //button group
         var bgroup = document.createElement('span');
         bgroup.classList.add("btn-group");
         var btn;
         // edit button
         btn = document.createElement('a');
         btn.href = "#";
         btn.classList.add("btn btn-warning");
         btn.innerHTML = "Edit";
         bgroup.appendChild(btn);
         // delete button
         btn = document.createElement('a');
         btn.href = "#";
         btn.classList.add("btn btn-danger");
         btn.innerHTML = "Delete";
         bgroup.appendChild(btn);


        link.appendChild(bgroup);
        return link;
    }

    //List Texture Packs
    if (!isNullOrUndefined(tplist)) {
        sendMessage("getdata", {}).then((data) => {
            var texturepacks = data.texturePacks||[];
            console.log(texturepacks);
            if (texturepacks instanceof Array && texturepacks.length === 0) {
                tplist.innerHTML = 'There are no themes. Please <a href="addtheme.html">add a theme</a>.';
                return;
            }
            tplist.innerHTML = "";
            tplist.classList.add("list-group");

            //default
            var defaulttp = genTPItem(getDefault(data))
            defaulttp.addEventListener('click',()=>{
                enableTP(-1);
            });
            if(data.currentTP === -1) {
                defaulttp.classList.add("active");
            }
            tplist.appendChild(defaulttp);

            texturepacks.forEach((tp,i)=>{
                /*var tpitem = document.createElement('li');
                var tpitemlink = document.createElement('a');
                tpitemlink.href = "#";
                tpitemlink.addEventListener('click',()=>{
                    enableTP(i);
                });
                tpitemlink.innerHTML = tp.name;
                tpitem.appendChild(tpitemlink);
                tplist.appendChild(tpitem);*/

                //NEW METHOD
                var tplink = genTPItem(tp);
                tplink.addEventListener('click',()=>{
                    enableTP(i);
                });
                
                if(data.currentTP === i) {
                    tplink.classList.add("active");
                }
                tplist.appendChild(tplink);
            });
        }).catch(()=>{
            tplist.innerHTML = 'Please enter Box Critters.';
            return;
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
                formItemValue.classList.add("form-control px-2");

                formItem.appendChild(formItemLabel);
                formItem.appendChild(formItemValue);
                createtpform.appendChild(formItem);
            });
            var button = document.createElement('button');
			button.classList.add("btn btn-primary");
            button.innerHTML = "Create Texture Pack";
            button.type = "submit";
            createtpform.appendChild(button);

            createtpform.addEventListener('submit', (e) => {
                event.preventDefault();
                createTP();
            });
        });
    }


    //reset
    if(!isNullOrUndefined(resetbutton)) {
        resetbutton.addEventListener('click', () => {
            sendMessageCB("reset",{},()=>{
                refreshPage();
            });
        });
    }

}, false);