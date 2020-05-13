//@ts-check
var addshaderbutton = document.querySelector("button#addshader");
/**
 * @type {HTMLTextAreaElement}
 */
var textarea = document.querySelector('textarea#shaderdata');
textarea.style.width = "100%";

var addshaderfrom = document.querySelector("form#addshaderform");
addshaderfrom.addEventListener('submit', noRedirectForm);

var preview = document.getElementById('preview');
var gallery = document.getElementById('gallery');

function shaderListing(shader ,i) {
    //div.tp-item
    var shaderitem = document.createElement('div');
    var tpitemclasses = "list-group-item tp-item btn-group"
    .split(" ");
    shaderitem.classList.add(...tpitemclasses);
    //a.tp-link
    var tplink = document.createElement("div");
    tplink.classList.add("tp-link");
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

    if(shader.packVersion) {
        //was innerText
        title.textContent += " ";
    }
    if(shader.new) {
        //was innertext
        title.textContent = " " + title.textContent;
    }

    if(shader.shaderVersion) {
        var sVersion = document.createElement('small');
        sVersion.classList.add("text-muted");
        sVersion.textContent = "[" + shader.shaderVersion + "]";
        title.appendChild(sVersion);
    }
    if(shader.new) {
        var tpUpdate = document.createElement('span');
        tpUpdate.classList.add("badge","badge-primary","badge-pill");
        tpUpdate.textContent = "New";
        title.prepend(tpUpdate);
    }

    //date created
    if (shader.date) {
        var date = document.createElement('small');
        date.classList.add("text-muted");
        date.textContent = "Created " + dateToString(shader.date);
        header.appendChild(date);
    }

    tplink.appendChild(header);

    //description
    if (shader.description) {
        var description = document.createElement('p');
        description.classList.add("mb-1");
        description.textContent = shader.description;
        tplink.appendChild(description);
    }

    //author
    if (shader.author) {
        var author = document.createElement('small');
        author.classList.add("text-muted");
        author.textContent = "created by " + shader.author;
        tplink.appendChild(author);
    }

    shaderitem.appendChild(tplink);

    

    return shaderitem;
}


async function AddShader(data) {
	console.log("addshader");
	data = decode(data);
	exists = await sendMessageBG("shaderexists",data.name);
	if(exists) {
		console.log("exists");
		throw "Shader exists";
	} else {
		console.log("valid");
		return await sendMessageBG("addshader",data);
	}
}

//Add TShadere Button
if(addshaderbutton){
    addshaderbutton.addEventListener('click', () => {
        var errormessage = document.getElementById('error');
        var successmessage = document.getElementById('success');
        AddShader(textarea.value)
            .then((msg) => {
                successmessage.style.display = "block";
                successmessage.textContent = msg;
                setTimeout(() => {
                    //window.location.href = "popup.html";
                    window.close();
                }, 500)
            }).catch((msg) => {
                errormessage.style.display = "block";
                errormessage.textContent = msg;
            })
    }, false);
}

if (getURLParams().data) {
    textarea.value = getURLParams().data;
    textarea.setAttribute("readonly", "");
    UpdatePreview()
    //addtpbutton.click();
}


function UpdatePreview() {
    console.log("UPDATE");
    var tp = decode(textarea.value);
    
    preview.textContent = "";
    gallery.textContent = "";

    preview.appendChild(shaderListing(tp));
    //gallery.appendChild(tpGallery(tp));
}
$(textarea).on('change keyup paste', UpdatePreview);