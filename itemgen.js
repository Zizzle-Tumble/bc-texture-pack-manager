var data = [];
["3d_black.png",
"3d_white.png",
"ballcap_black.png",
"ballcap_blue.png",
"ballcap_green.png",
"bunny_blue.png",
"bunny_pink.png",
"bunny_white.png",
"easteregg_a.png",
"easteregg_b.png",
"easteregg_c.png",
"float_yellow.png",
"headphones_white.png",
"hoodie_blue.png",
"hoodie_pink.png",
"monk.png",
"paperhat.png",
"party_green.png",
"pirate_capt_black.png",
"plaid_red.png",
"pot.png",
"propeller.png",
"sleeping.png",
"space_blue.png",
"space_red.png",
"toque_blue.png",
"toque_pink.png",
"toque_purple.png",
"toque_white.png",
"tshirt_white.png",
"viking.png"].forEach(item=>{
var format = {};
format.name = item.split(".")[0];
format.required=false;
format.label = format.name.replace("_"," ");
format.label = format.label.split("")[0].toUpperCase() + format.label.slice(1);
format.default="icons/" + item;
format.category = "icons";
data.push(format);
});
