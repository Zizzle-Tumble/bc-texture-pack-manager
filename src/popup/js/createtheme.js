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

function createTP() {
    /**
     * @type {HTMLTextAreaElement}
     */
    var textarea = document.querySelector('textarea#tpdata');
    var formData = new FormData(createtpform);
    var data = {};
    formData.forEach(function (value, key) {
        data[key] = value;
    });
    data.date = Date.now();
    textarea.value = encode(data);
    return false;
}


//Create Texture Psck Form
document.addEventListener('DOMContentLoaded', () => {
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
            formItemValue.classList.add("form-control","px-2");
            if(f.required){
                formItemValue.setAttribute("required","");
            }

            formItem.appendChild(formItemLabel);
            formItem.appendChild(formItemValue);
            createtpform.appendChild(formItem);
        });
        var button = document.createElement('button');
        button.classList.add("btn", "btn-primary");
        button.innerHTML = "Generate Texture Pack Code";
        button.type = "submit";
        createtpform.appendChild(button);

        createtpform.addEventListener('submit', (e) => {
            event.preventDefault();
            createTP();
        });
    });
});