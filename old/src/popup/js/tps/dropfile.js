$(()=>{
    var dropzone = document.getElementById('dropzone');
    var dropzonecontent = document.getElementById('dropzone-content');

    function showDropZone() {
        dropzone.style.display = "block";
        dropzonecontent.style.display = "block";
    }
    function hideDropZone() {
        dropzone.style.display = "none";
        dropzonecontent.style.display = "none";
    }

    function allowDrag(e) {
        if (true) {  // Test that the item being dragged is a valid one
            e.dataTransfer.dropEffect = 'link';
            e.preventDefault();
        }
    }

    async function upload(files) {
        //console.log(files);
        if(files.length>1) {
            throw "Only one file";
        }

        var file = files[0];
        const reader = new FileReader()
        return new Promise((resolve,reject)=>{
            reader.onerror = error => reject(error)
            reader.onload = event => resolve(JSON.parse(event.target.result)) // desired file content
            reader.readAsText(file) // you could also read images and other binaries
        });

    }

    window.addEventListener('dragenter', function(e) {
        showDropZone();
    });

    dropzone.ondrop = function(e) {
        e.preventDefault();
        hideDropZone();
        upload(e.dataTransfer.files).then((data=>{
            console.log(data);
            var tpencoded = encode(cleanEmpty(data));

            var newURL = browser.extension.getURL('popup/addtheme.html') + "?data=" + tpencoded;
            console.log(newURL);

            //window.location.href = newURL;
            window.open(newURL,'_blank');
            //sendMessageBG("createtab",{ url: newURL});
            
        })).catch((e)=>{
            dropzone.innerText = e;
        });
        
    }

    dropzone.ondragover = function(e){
        allowDrag(e);
        return false;
    }

    dropzone.ondragleave = function(e){
        hideDropZone();
        return false;
    }
});