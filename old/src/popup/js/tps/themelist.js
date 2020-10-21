//@ts-check
document.addEventListener('DOMContentLoaded', () => {
    var tplist = document.querySelector("div#tplist");
    var ctplist = document.querySelector("div#ctplist");
    var refreshbutton = document.querySelector('#btn-refresh');
    var resetbutton = document.querySelector('#btn-reset');

    function refreshPage() {
        browser.tabs.reload({ 'bypassCache': true }, () => {
            refreshList();
        });
    }


    function enableTP(id) {
        var errormessage = document.getElementById('error');
        var successmessage = document.getElementById('success');
        sendMessageBG("settp", { id }).then(msg => {
            sendMessageBG('refreshrules', id).then(() => {
                refreshPage();
            });
            successmessage.style.display = "block";
            errormessage.textContent = msg;
            setTimeout(() => {
                successmessage.style.display = "none";
            }, 500)
        });
    }

    function deleteTP(id) {
        sendMessageBG("deletetp", { id }).then(msg => {
            sendMessageBG('refreshrules', id).then(() => {
                refreshPage();
            });
        });

    }

    async function getDefault(data) {
        let tp = await getDefaultTP();

        var des = [
            //Description by Eribetra
            "The default, vanilla texture pack.",
            //Description by Blackout03
            "Wanna go retro? Use this pack!",
			//(new) Description by flines
			"This is the classical look of Box Critters"
        ]

        tp.description = des[Math.floor(Math.random() * des.length)];
        tp.readonly = true;
        return tp;
    }

    function setupActionButtons() {
        var togglebtn = document.getElementById('toggleedit');
        var tpbtns = document.querySelectorAll('.tp-item .btn');
        togglebtn.addEventListener("click", () => {
            tpbtns.forEach(btn => {
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
        <a href="/admin/userA" class="btn btn-success"><span class="glyphicon glyphicon-edit"></span> Edit</a> 
        <button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span> Delete</button>
        </span>
    </a>
    */

    function genTPItem(tp, i) {
        //div.tp-item
        var tpitem = document.createElement('div');
        tpitem.id = i;
        var tpitemclasses = "list-group-item tp-item btn-group"
            .split(" ");
        tpitem.classList.add(...tpitemclasses);
        //a.tp-link
        var tplink;
        if(i !== -1) {
            tplink = document.createElement("a");
            tplink.href = "#";
        } else {
            tplink = document.createElement("div");
        }
        tplink.classList.add("tp-link");
        //header
        var header = document.createElement('div');
        var headerclasses = "d-flex w-100 justify-content-between"
            .split(" ");
        header.classList.add(...headerclasses);
        //title
        var title = document.createElement('h5');
        title.classList.add("mb-1");
        title.textContent = tp.name;
        header.appendChild(title);

        if (tp.packVersion) {
            //was innerText
            title.textContent += " ";
        }
        if (tp.new) {
            //was innerText
            title.textContent = " " + title.textContent;
        }

        if (tp.packVersion) {
            var tpVersion = document.createElement('small');
            tpVersion.classList.add("text-muted");
            tpVersion.textContent = "[" + tp.packVersion + "]";
            title.appendChild(tpVersion);
        }
        if (tp.new) {
            var tpUpdate = document.createElement('span');
            tpUpdate.classList.add("badge", "badge-success", "badge-pill");
            tpUpdate.textContent = "Updated";
            title.prepend(tpUpdate);
        }

        //date created
        if (tp.date) {
            var date = document.createElement('small');
            date.classList.add("text-muted");
            date.textContent = "Created " + dateToString(tp.date);
            header.appendChild(date);
        }

        tplink.appendChild(header);

        //description
        if (tp.description) {
            var description = document.createElement('p');
            description.classList.add("mb-1");
            description.textContent = tp.description;
            tplink.appendChild(description);
        }

        //author
        if (tp.author) {
            var author = document.createElement('small');
            author.classList.add("text-muted");
            author.textContent = "created by " + tp.author;
            tplink.appendChild(author);
        }

        tpitem.appendChild(tplink);

        //button group
        var btn;
        var btnClasses;
        // edit button
        /*btn = document.createElement('a');
        btn.href = "#";
        btnClasses = 'btn btn-success'
        .split(" ");
        btn.classList.add(...btnClasses);
        btn.textContent = '<i class="fas fa-info"></i>';
        btn.addEventListener('click', () => {
           infoPage(i)
        });
        tpitem.appendChild(btn);*/

        if (i !== -1) {
            // delete button
            btn = document.createElement('a');
            btn.href = '#';
            btnClasses = 'btn btn-danger'
                .split(" ");
            btn.classList.add(...btnClasses);
            var icon = document.createElement('i');
            icon.classList.add('fas', 'fa-trash-alt');
            btn.appendChild(icon);
            btn.addEventListener('click', () => {
                deleteTP(i);
            });
            tpitem.appendChild(btn);

            tplink.addEventListener('click', () => {
                enableTP(i);
                refreshPage();
            });
        }



        return tpitem;
    }

    //List Texture Packs
    async function refreshList() {
		var data = await sendMessageBG("getdata")
		if(!data) {
            console.log(e);
            tplist.textContent = "";
            tplist.classList.add('middle-center');

            var msgP = document.createTextNode("An Error has occored.");
            tplist.appendChild(msgP);
            var link = document.createElement("a");
            link.text = "Send Feedback";
            link.href = "https://boxcrittersmods.ga/feedback/send?repo=bc-texture-pack-manager";
            tplist.appendChild(link);
            var info = $(`<textarea cols="50" style="overflow-y:scroll;" readonly>${e.stack}${e.name}${e.message}</textarea>`)[0];
            tplist.appendChild(info);

            return;
        };
        var texturepacks = data.texturePacks || [];
        console.log(data);
        console.log(texturepacks);
        if (texturepacks instanceof Array && texturepacks.length === 0) {
            tplist.classList.add('middle-center');
            var text = document.createTextNode("There are no Texture Packs.");
            tplist.appendChild(text);
            var addthemelink = document.createElement('a');
            addthemelink.href = "addtheme.html";
            addthemelink.classList.add('btn', 'btn-success');
            addthemelink.target = "_blank";
            addthemelink.textContent = "Add Texture Pack";
            tplist.appendChild(addthemelink);
            return;
        }
        ctplist.textContent = "";
        tplist.innerHTML = '<div class="card-header"><span>Available Texture Packs</span></div>';
        //tplist.classList.add("list-group");

        data.currentTP.forEach((i) => {
            var tp = texturepacks[i];
            if(!tp) {
                enableTP(i);
                return;
            }

            debugger;
            var tplink = genTPItem(tp, i);
            tplink.classList.add("list-group-item-success");

            ctplist.appendChild(tplink);


        });

		//default
		var defaulttp = genTPItem(await getDefault(data),-1)
		defaulttp.classList.add("list-group-item-success");
		ctplist.appendChild(defaulttp);

        

        texturepacks.forEach((tp, i) => {

            //NEW METHOD
            if (data.currentTP.includes(i)) {
                return
            }
            var tplink = genTPItem(tp, i);

            tplist.appendChild(tplink);
        });
        setupActionButtons();	
	}
	sendMessageBG("setTab",0);

    refreshList();

    //refresh
    refreshbutton.addEventListener('click', () => {
        sendMessageBG("refreshtp").then(() => {
            console.log("REFRESHING...");

            refreshPage();
        });
    });

    //reset
    resetbutton.addEventListener('click', () => {
        sendMessageBG("reset").then(() => {
            console.log("RESETTING...");

            refreshPage();
        });
    });
}, false);