//@ts-check
/**
 * @type {HTMLFormElement}
 */
var createtpform = document.querySelector("form#createtpform");

/**
 * 
 * @param {number} v 
 */
function getVersionIndicator(v) {
    var verinput = document.createElement('input');
    verinput.type = "hidden";
    verinput.name = "version";
    verinput.value = v.toString();
    return verinput;
}

function normaliseFileName(text) {
    return text.split(" ").join("");
}

function getFormData(removeEmpty = false) {
    var formData = new FormData(createtpform);
    var data = {};
    formData.forEach(function (value, key) {
        if ((value && value !== "") || !removeEmpty) data[key] = value;
    });
    data.date = Date.now();
    data.packVersion = "0.1";
    return data;
}

function createTP() {
    /**
     * @type {HTMLTextAreaElement}
     */
    var textarea = document.querySelector('textarea#tpdata');
    var data = getFormData(true)
    // @ts-ignore
    textarea.value = encode(data);
    return false;
}

function createTPJSON() {
    var dataurl = "data:text/json;charset=utf-8,"
    /**
     * @type {HTMLTextAreaElement}
     */
    var textarea = document.querySelector('textarea#tpdata');
    var data = getFormData();
    var url = dataurl + encodeURIComponent(JSON.stringify(data, 0, 2));
    var downloadLink = document.createElement("a");
    var filename = data.name || "texturepack";
    filename = normaliseFileName(filename);
    downloadLink.setAttribute("href", url);
    downloadLink.setAttribute("download", filename + ".bctp.json");
    downloadLink.click();

    textarea.value = JSON.stringify(data, 0, 2);
    return false;
}



//Create Texture Psck Form
document.addEventListener('DOMContentLoaded', () => {
    var lastCategory = [""];
    /**
     * @type {Category[]}
     */
    var currentCategoryGroups = [];
    // @ts-ignore
    getFormats().then(formats => {
        var currentVersion = formats.texturePack.length - 1;
        createtpform.appendChild(getVersionIndicator(currentVersion))
        formats = formats.texturePack[currentVersion];

        /*
       <div class="tp-attrib card">
            <div class="card-header">
                <span>Name</span>

            </div>
            <img src="https://dummyimage.com/500" class="card-img" alt="">
            <div class="card-body">
                <input name="name" class="form-control px-2" required="">
            </div>
        </div>
        */

        formats.forEach((f, fid) => {
            var formItem;
            if (f.hidden) {
                formItem = document.createElement("input");
                formItem.name = f.name;
                formItem.type = "hidden";

            }
            if (!f.hidden) {
                formItem = document.createElement('div');
                formItem.classList.add("tp-attrib", "card");

                //HEADER
                var header = document.createElement('div');
                header.classList.add('card-header');
                var formItemLabel = document.createElement('span');
                formItemLabel.innerHTML = f.label||f.name;
                header.appendChild(formItemLabel);

                var img;
                var defaultimg;
                if (f.category !== "info") {
                    if (f.default) {
                        img = new Image();
                        formItem.append(img);
                        img.classList.add('card-img');
                        getFileURL(f.default).then((url) => {
                            img.setAttribute('src', url);
                            defaultimg = url;
                            img.onload = ()=>{
                                /*console.log(img.width/img.height)
                                var aspect = img.width/img.height;
                                img.width = 160*aspect;
                                img.height = 160;*/

                            };
                        });
                    }
                }
                /**
                 * @type {HTMLInputElement|HTMLParagraphElement}
                 */
                var formItemValue;
                formItemValue = document.createElement('input');

                var infocol = document.createElement('div');
                infocol.classList.add("col-12");

                var body = document.createElement('div');
                body.classList.add('card-body');
                formItemValue.name = f.name;
                formItemValue.classList.add("form-control","px-2");
                if(img){
                    $(formItemValue).change((e)=>{
                        console.log(e);
                        console.log($(e.currentTarget).closest('.tp-attrib'));
                        let img = $(e.currentTarget).closest('.tp-attrib').find('img');
                        
                        img.attr("src",e.currentTarget.value);
                        img.on("error",()=>{
                            img.attr("src",defaultimg);
                        })
                    });
                }
                if(!f.default&&f.category!=="info") {
                    formItemValue = document.createElement('p');
                    formItemValue.classList.add("display-4");
                    formItemValue.innerHTML = "Coming Soon"
                }
                body.appendChild(formItemValue);

                formItem.appendChild(header);
                if(img) formItem.appendChild(img);
                formItem.appendChild(body);


                /***************************************** *//*
                formItem = document.createElement('div');
                var formItemLabel = document.createElement('span');
                var formItemValue = document.createElement('input');

                formItemLabel.innerHTML = f.label||f.name;
                formItemValue.name = f.name;
                formItemValue.classList.add("form-control","px-2");
                if(f.required){
                    formItemValue.setAttribute("required","");
                }
                if(!f.default&&f.category!=="info") {
                    formItemValue.setAttribute("readonly","");
                    formItemValue.placeholder = "Coming Soon"
                }

                formItem.appendChild(formItemLabel);
                formItem.appendChild(formItemValue);*/




            }

            if (f.category) {
                var category = f.category.split("/");
                for (let i = 0; i < category.length; i++) {
                    if (lastCategory[i] !== category[i]) {
                        lastCategory.length = i + 1;
                        currentCategoryGroups.length = i + 1

                        lastCategory[i] = category[i];
                        currentCategoryGroups[i] = new Category(category[i], fid == 0);
                        if (i == 0) {
                            createtpform.appendChild(currentCategoryGroups[i].getElement());
                        }
                        else {
                            currentCategoryGroups[i - 1].appendChild(currentCategoryGroups[i]);
                        }
                        /*var categoryHeading = document.createElement('h'+(i+1));
                        categoryHeading.innerText = category[i];*/
                    }
                }
                currentCategoryGroups[currentCategoryGroups.length - 1].appendChild(formItem)
            } else {
                createtpform.appendChild(formItem);
            }
        });
        var button = document.createElement('button');
        button.classList.add("btn", "btn-primary");
        button.innerHTML = "Generate Texture Pack Code";
        button.type = "submit";
        createtpform.appendChild(button);


        var jsonbutton = document.createElement('a');
        jsonbutton.classList.add("btn", "btn-secondary");
        jsonbutton.innerHTML = "Download One Click File";
        jsonbutton.href = "#";
        createtpform.appendChild(jsonbutton);
        jsonbutton.addEventListener("click", (e) => {
            event.preventDefault();
            createTPJSON();
        })

        createtpform.addEventListener('submit', (e) => {
            event.preventDefault();
            createTP();
        });
    });
});