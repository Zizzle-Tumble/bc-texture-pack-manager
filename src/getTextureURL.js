
/**
 * 
 * @param {{name:string,label:string,required:boolean,hidden:boolean,site:string,type:string,category:string,default:string}} texture 
 * @param {object} sites 
 */
//TODO: create Texture url generation
function getTextureURL(texture, sites,versionInfo) {
    debugger;
    var site = sites.find(s=>s.name==texture.site);
    if(!site) return;
    var catList = texture.category ? texture.category.split("/"):[""];
    var subType = catList[0];
    var dirset =  site[texture.type];
    var dir = "";
    if(typeof dirset == "object" && subType) {
        dir = dirset[subType];
    } else {
        dir = dirset;
    }
    return site.url + dir + texture.name + ".png";
}