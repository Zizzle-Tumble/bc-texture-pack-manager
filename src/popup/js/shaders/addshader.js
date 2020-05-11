/@ts-check
var addshaderbutton = document.querySelector("button#addshader");
/**
 * @type {HTMLTextAreaElement}
 */
var textarea = document.querySelector('textarea#shaderdata');
textarea.style.width = "100%";

var addshaderfrom = document.querySelector("form#addshaderform");
addtpfrom.addEventListener('submit', noRedirectForm);

var preview = document.getElementById('preview');
var gallery = document.getElementById('gallery');


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