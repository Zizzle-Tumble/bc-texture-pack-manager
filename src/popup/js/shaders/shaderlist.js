//@ts-check
document.addEventListener('DOMContentLoaded', () => {
    var shaderlist = document.querySelector("div#shaderlist");
    var cshaderlist = document.querySelector("div#cshaderlist");
    var refreshbutton = document.querySelector('#btn-refresh');
    var resetbutton = document.querySelector('#btn-reset');

    function refreshPage() {
        browser.tabs.reload({ 'bypassCache': true }, () => {
            refreshList();
        });
    }


    function enableShader(id) {
        var errormessage = document.getElementById('error');
        var successmessage = document.getElementById('success');
        sendMessageBG("setshader", { id }).then(msg => {
            sendMessageBG('refreshshaders', id).then(() => {
                refreshPage();
            });
            successmessage.style.display = "block";
            errormessage.textContent = msg;
            setTimeout(() => {
                successmessage.style.display = "none";
            }, 500)
        });
    }

    function deleteShader(id) {
        sendMessageBG("deleteshader", { id }).then(msg => {
            sendMessageBG('refreshshaders', id).then(() => {
                refreshPage();
            });
        });

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

    function genShaderItem(shader, i) {
        //div.tp-item
        var shaderitem = document.createElement('div');
        shaderitem.id = i;
        var tpitemclasses = "list-group-item tp-item btn-group"
            .split(" ");
        shaderitem.classList.add(...tpitemclasses);
        //a.tp-link
        var shaderlink;
        if(i !== -1) {
            shaderlink = document.createElement("a");
            shaderlink.href = "#";
        } else {
            shaderlink = document.createElement("div");
        }
        shaderlink.classList.add("tp-link");
        //header
        var header = document.createElement('div');
        var headerclasses = "d-flex w-100 justify-content-between"
            .split(" ");
        header.classList.add(...headerclasses);
        //title
        var title = document.createElement('h5');
        title.classList.add("mb-1");
        title.textContent = shader.name;
        header.appendChild(title);

		if (shader.shaderVersion) {
            //was innerText
            title.textContent += " ";
        }
        if (shader.new) {
            //was innerText
            title.textContent = " " + title.textContent;
        }

		if (shader.shaderVersion) {
            var sVersion = document.createElement('small');
            sVersion.classList.add("text-muted");
			sVersion.textContent = "[" + shader.shaderVersion + "]";
            title.appendChild(sVersion);
        }
        if (shader.new) {
            var tpUpdate = document.createElement('span');
            tpUpdate.classList.add("badge", "badge-success", "badge-pill");
            tpUpdate.textContent = "Updated";
            title.prepend(tpUpdate);
        }

        //date created
        if (shader.date) {
            var date = document.createElement('small');
            date.classList.add("text-muted");
            date.textContent = "Created " + dateToString(shader.date);
            header.appendChild(date);
        }

        shaderlink.appendChild(header);

        //description
        if (shader.description) {
            var description = document.createElement('p');
            description.classList.add("mb-1");
            description.textContent = shader.description;
            shaderlink.appendChild(description);
        }

        //author
        if (shader.author) {
            var author = document.createElement('small');
            author.classList.add("text-muted");
            author.textContent = "created by " + shader.author;
            shaderlink.appendChild(author);
        }

        shaderitem.appendChild(shaderlink);

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
				deleteShader(i);
            });
            shaderitem.appendChild(btn);

            shaderlink.addEventListener('click', () => {
                enableShader(i);
                refreshPage();
            });
        }



        return shaderitem;
    }

    //List Shaders
    async function refreshList() {	
		var data = await sendMessageBG("getdata")
		if(!data) {
            console.log(e);
            shaderlist.textContent = "";
            shaderlist.classList.add('middle-center');

            var msgP = document.createTextNode("An Error has occored.");
            shaderlist.appendChild(msgP);
            var link = document.createElement("a");
            link.text = "Send Feedback";
            link.href = "https://boxcrittersmods.ga/feedback/send?repo=bc-texture-pack-manager";
            shaderlist.appendChild(link);
            var info = $(`<textarea cols="50" style="overflow-y:scroll;" readonly>${e.stack}${e.name}${e.message}</textarea>`)[0];
            shaderlist.appendChild(info);

            return;
        };
        var shaders = data.shaders || [];
        console.log(data);
        console.log(shaders);
        if (shaders instanceof Array && shaders.length === 0) {
            shaderlist.classList.add('middle-center');
            var text = document.createTextNode("There are no Shaders.");
            shaderlist.appendChild(text);
            var addshaderlink = document.createElement('a');
            addshaderlink.href = "addshader.html";
            addshaderlink.classList.add('btn', 'btn-success');
            addshaderlink.target = "_blank";
            addshaderlink.textContent = "Add Shader";
            shaderlist.appendChild(addshaderlink);
            return;
        }
        cshaderlist.textContent = "";
        shaderlist.innerHTML = '<div class="card-header"><span>Available Shaders</span></div>';
        shaderlist.classList.add("list-group");

        data.currentShader.forEach((i) => {
            var tp = shaders[i];
            if(!tp) {
                enableTP(i);
                return;
            }

            debugger;
            var tplink = genShaderItem(tp, i);
            tplink.classList.add("list-group-item-success");

            cshaderlist.appendChild(tplink);


        });

        

        shaders.forEach((tp, i) => {

            //NEW METHOD
            if (data.currentShader.includes(i)) {
                return
            }
            var tplink = genShaderItem(tp, i);

            shaderlist.appendChild(tplink);
        });
        setupActionButtons();	
	}
	sendMessageBG("setTab",1);

    refreshList();

    //reset
    resetbutton.addEventListener('click', () => {
        sendMessageBG("reset").then(() => {
            console.log("RESETTING...");

            refreshPage();
        });
    });
}, false);