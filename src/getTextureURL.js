
/**
 * 
 * @param {{name:string,label:string,required:boolean,hidden:boolean,site:string,type:string,category:string,filename:string}} texture 
 * @param {object} sites 
 */
//TODO: create Texture url generation
function getTextureURL(texture, sites,versionInfo) {
    var site = sites.find(s=>s.name==texture.site);
    if(!site) return;
    var catList = texture.category ? texture.category.split("/"):[""];
    var subType = catList[0];
    var dirset =  site[texture.type];
    var filename = texture.filename || texture.name + ".png";
    filename = filename.replace("{CLIENTVER}",versionInfo.name);
    filename = filename.replace("{ITEMVER}",versionInfo.items);
    var dir = "";
    if(typeof dirset == "object" && subType) {
        dir = dirset[subType];
    } else {
        dir = dirset;
    }
    var textureurl = site.url + dir + filename;
    console.debug(texture.name + " => " + textureurl);
    return textureurl;
}