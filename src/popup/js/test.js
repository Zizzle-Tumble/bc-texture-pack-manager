$(".tp-attrib input").change(function(e) {
    console.log(e);
    console.log($(e.currentTarget).closest('.tp-attrib'));
    var img = $(e.currentTarget).closest('.tp-attrib').find('img');
    
    img.attr("src",e.currentTarget.value);
    img.on( "error",()=>{
        img.attr("src","https://dummyimage.com/160");
    })
   });