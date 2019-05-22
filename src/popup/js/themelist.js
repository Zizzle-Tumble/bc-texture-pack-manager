//@ts-check
document.addEventListener('DOMContentLoaded', () => {
    var tplist = document.querySelector("div#tplist");
    var resetbutton = document.querySelector('#btn-reset');    

    function refreshPage() {
        browser.tabs.reload({'bypassCache':true},()=>{
            refreshList();
        });
    }


    function enableTP(id) {        
        var errormessage = document.getElementById('error');
        var successmessage = document.getElementById('success');
        sendMessageBG("settp", { id }).then(msg => {
            sendMessageBG('refreshtp', id).then(() => {
                refreshPage();
            });
            successmessage.style.display = "block";
            errormessage.innerHTML = msg;
            setTimeout(() => {
                successmessage.style.display = "none";
            }, 500)
        });
    }

    function deleteTP(id) {
        sendMessageBG("deletetp", { id }).then(msg => {
            sendMessageBG('refreshtp', id).then(() => {
                refreshPage();
            });
        });

    }

    function getDefault(data) {
        let tp = {};
        tp.name = "BoxCritters";
        tp.author = "RocketSnail";
        tp.date = new Date("5 Jan 2019");
        tp.readonly = true;

        var des = [
            //Description by Eribetra
            "The default, vanilla texture pack.",
            //Description by Blackout03
            "Wanna go retro? Use this pack!"
        ]

        tp.description = des[Math.floor(Math.random() * des.length)];
        tp.version = 1;
        return tp;
    }

    function setupActionButtons() {
        var togglebtn = document.getElementById('toggleedit');
        var tpbtns = document.querySelectorAll('.tp-item .btn');
        togglebtn.addEventListener("click",()=>{
            tpbtns.forEach(btn=>{
                btn.classList.toggle("edit");
            });
        });
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

    function dateToString(unix){
        var date = new Date(unix);

        let dd = date.getDate();
        let mm = (date.getMonth() + 1);
        let yyyy = date.getFullYear();

        //Enables 0 beginning numbers
        /*if(dd<10) 
        {
            dd='0'+dd;
        } 

        if(mm<10) 
        {
            mm='0'+mm;
        } */


        return dd+'/'+mm+'/'+yyyy;

    }

    function genTPItem(tp ,i) {
        //div.tp-item
        var tpitem = document.createElement('a');
        var tpitemclasses = "list-group-item tp-item btn-group"
        .split(" ");
        tpitem.classList.add(...tpitemclasses);
        //a.tp-link
        var tplink = document.createElement("a");
        tplink.classList.add("tp-link");
        tplink.href = "#";
        //header
        var header = document.createElement('div');
        var headerclasses = "d-flex w-100 justify-content-between"
        .split(" ");
        header.classList.add(...headerclasses);
        //title
        var title = document.createElement('h5');
        title.classList.add("mb-1");
        title.innerHTML = tp.name;
        header.appendChild(title);
        if(tp.packVersion) {
            title.innerText += " ";
            var tpVersion = document.createElement('small');
            tpVersion.classList.add("text-muted");
            tpVersion.innerHTML = "[" + tp.packVersion + "]";
            title.appendChild(tpVersion);
        }
        if(tp.new) {
            title.innerText = " " + title.innerText
            var tpUpdate = document.createElement('span');
            tpUpdate.classList.add("badge","badge-primary","badge-pill");
            tpUpdate.innerHTML = "New";
            title.prepend(tpUpdate);
        }

        //date created
        if (tp.date) {
            var date = document.createElement('small');
            date.classList.add("text-muted");
            date.innerHTML = "Created " + dateToString(tp.date);
            header.appendChild(date);
        }

        tplink.appendChild(header);

        //description
        if (tp.description) {
            var description = document.createElement('p');
            description.classList.add("mb-1");
            description.innerHTML = tp.description;
            tplink.appendChild(description);
        }

        //author
        if (tp.author) {
            var author = document.createElement('small');
            author.classList.add("text-muted");
            author.innerHTML = "created by " + tp.author;
            tplink.appendChild(author);
        }

        tpitem.appendChild(tplink);

        //button group
        var btn;
        var btnClasses;
        // edit button
        /*btn = document.createElement('a');
        btn.href = "#";
        btnClasses = 'btn btn-primary'
        .split(" ");
        btn.classList.add(...btnClasses);
        btn.innerHTML = '<i class="fas fa-info"></i>';
        btn.addEventListener('click', () => {
           infoPage(i)
        });
        tpitem.appendChild(btn);*/
        
        if(!tp.readonly){
            // delete button
            btn = document.createElement('a');
            btn.href = '#';
            btnClasses = 'btn btn-danger'
            .split(" ");
            btn.classList.add(...btnClasses);
            btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            btn.addEventListener('click', () => {
                deleteTP(i);
            });
            tpitem.appendChild(btn);
        }

        tplink.addEventListener('click', () => {
            enableTP(i);
        });

        

        return tpitem;
    }

    //List Texture Packs
    function refreshList() {
        sendMessageBG("getdata").then((data) => {
            var texturepacks = data.texturePacks || [];
            console.log(texturepacks);
            if (texturepacks instanceof Array && texturepacks.length === 0) {
                tplist.classList.add('middle-center');
                tplist.innerHTML = '<p>There are no Texture Packs.</p><a href="addtheme.html" target="_blank" class="btn btn-primary">Add Texture Pack</a>';
                return;
            }
            tplist.innerHTML = "";
            tplist.classList.add("list-group");

            //default
            var defaulttp = genTPItem(getDefault(data),-1)
            if (data.currentTP === -1) {
                defaulttp.classList.add("list-group-item-success");
            }
            tplist.appendChild(defaulttp);

            texturepacks.forEach((tp, i) => {
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
                var tplink = genTPItem(tp,i);
                if (data.currentTP === i) {
                    tplink.classList.add("list-group-item-success");
                }
                
                tplist.appendChild(tplink);
            });
            setupActionButtons();
        }).catch((e) => {
            console.log(e);
            tplist.innerHTML = "";
            tplist.classList.add('middle-center');

            var msgP = document.createTextNode("Please enter Box Critters");
            tplist.appendChild(msgP);

            var bcBtn = document.createElement('a');
            bcBtn.classList.add("btn","btn-primary");
            bcBtn.href = "#";
            tplist.appendChild(bcBtn);

            findTabWithURl('https://boxcritters.com/*')
            .then(tab=>{
                if(!tab) {//tab not open
                    bcBtn.href = "https://boxcritters.com/play/index.html";
                    bcBtn.target = "_blank";
                    bcBtn.innerHTML = "Open Tab";
                } else if(tab.active) {//If tab is open and being viewed
                    //if tab open and current
                    bcBtn.innerHTML = "Refresh Page";
                    bcBtn.addEventListener('click',()=>{
                        refreshPage();
                    });
                } else { //if tab open and not current
                    bcBtn.innerHTML = "Switch to tab";
                    bcBtn.addEventListener('click',()=>{
                        browser.tabs.highlight({'tabs':tab.index},()=>{
                            refreshPage();
                        });
                    });
                }

            }).catch(r =>{
                console.log("Error finding tab:",r);
                //If no tab open
                bcBtn.href = "https://boxcritters.com/play/index.html";
                bcBtn.target = "_blank";
                bcBtn.innerHTML = "Open Tab";
            })
            return;
        });
    }
    refreshList();

    //reset
    resetbutton.addEventListener('click', () => {
        sendMessageBG("reset").then(() => {
            console.log("RESETTING...");
            
            refreshPage();
        });
    });

    

}, false);