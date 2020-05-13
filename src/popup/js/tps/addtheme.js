//@ts-check
var addtpbutton = document.querySelector("button#addtheme");
/**
 * @type {HTMLTextAreaElement}
 */
var textarea = document.querySelector('textarea#tpdata');
textarea.style.width = "100%";

var addtpfrom = document.querySelector("form#addtpform");
addtpfrom.addEventListener('submit', noRedirectForm);

var preview = document.getElementById('preview');
var gallery = document.getElementById('gallery');

function tpListing(tp ,i) {
    //div.tp-item
    var tpitem = document.createElement('div');
    var tpitemclasses = "list-group-item tp-item btn-group"
    .split(" ");
    tpitem.classList.add(...tpitemclasses);
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
    title.textContent = tp.name;
    header.appendChild(title);

    if(tp.packVersion) {
        //was innerText
        title.textContent += " ";
    }
    if(tp.new) {
        //was innertext
        title.textContent = " " + title.textContent;
    }

    if(tp.packVersion) {
        var tpVersion = document.createElement('small');
        tpVersion.classList.add("text-muted");
        tpVersion.textContent = "[" + tp.packVersion + "]";
        title.appendChild(tpVersion);
    }
    if(tp.new) {
        var tpUpdate = document.createElement('span');
        tpUpdate.classList.add("badge","badge-primary","badge-pill");
        tpUpdate.textContent = "New";
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
    btnClasses = 'btn btn-primary'
    .split(" ");
    btn.classList.add(...btnClasses);
    btn.textContent = '<i class="fas fa-info"></i>';
    btn.addEventListener('click', () => {
       infoPage(i)
    });
    tpitem.appendChild(btn);*/

    

    return tpitem;
}

function tpGallery(tp) {
    var row = document.createElement('div');
    row.classList.add("row");
    var keys = Object.keys(tp);

    Object.values(tp).forEach((url,i) => {
        if(!(typeof url == "string")||!url.startsWith("http")) {
            return
        }
        var card = document.createElement('div');
        card.classList.add('card','tp-attrib');
        var head = document.createElement('div');
        head.classList.add('card-header');
        head.textContent = keys[i];
        card.appendChild(head);

        var img = new Image();
        img.src = url
        img.onload = () =>{
            card.appendChild(img);
            row.appendChild(card);
        }
        img.classList.add('card-img');
    });
    return row;
}

async function AddTP(data) {
    console.log("addtp");
    data = decode(data);
    debugger
    var exists = await sendMessageBG("tpexists", data.name);
    if (exists) {
        console.log("exists");

        throw "Texture pack exists";
        return;
    } else {
        console.log("valid");

        return await sendMessageBG("addtp", data);
        //return;
    }
}

//Add Texture Pack Button
if(addtpbutton){
    addtpbutton.addEventListener('click', () => {
        var errormessage = document.getElementById('error');
        var successmessage = document.getElementById('success');
        AddTP(textarea.value)
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

    preview.appendChild(tpListing(tp));
    gallery.appendChild(tpGallery(tp));
}
$(textarea).on('change keyup paste', UpdatePreview);