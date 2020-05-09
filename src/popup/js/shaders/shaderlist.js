//@ts-check
document.addEventListener('DOMContentLoaded', () => {
    var shaderlist = document.querySelector("div#shaderlist");
    var ctplist = document.querySelector("div#cshaderlist");
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
        sendMessageBG("deletetshader, { id }).then(msg => {
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

    function genShaderItem(tp, i) {
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

    //List Shaders
    async function refreshList() {	
	}
	sendMessageBG("setTab",0);

    refreshList();

    //refresh
    refreshbutton.addEventListener('click', () => {
        sendMessageBG("refreshshader").then(() => {
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