// ==UserScript==
// @name         Box Critters Texture Pack Manager
// @namespace    https://boxcrittersmods.ga/authors/tumblegamer/
// @supportURL   http://discord.gg/D2ZpRUW
// @version      3.2.0.202
// @description  A great extension that lets you easily switch between, add and create new themes to use on Box Critters!
// @author       TumbleGamer, Zizzle
// @icon         https://raw.githubusercontent.com/boxcrittersmods/bc-texture-pack-manager/master/logo.png
// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js
// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js
// @require      https://github.com/SArpnt/cardboard/raw/master/script.user.js
// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js
// @require      https://github.com/tumble1999/modial/raw/master/modial.js
// @require      https://github.com/SArpnt/ctrl-panel/raw/master/script.user.js
// @require      https://github.com/tumble1999/critterguration/raw/master/critterguration.user.js
// @match        https://boxcritters.com/play/
// @match        https://boxcritters.com/play/?*
// @match        https://boxcritters.com/play/#*
// @match        https://boxcritters.com/play/index.html
// @match        https://boxcritters.com/play/index.html?*
// @match        https://boxcritters.com/play/index.html#*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
	'use strict';
	let BCTPM = new TumbleMod({
		dictionary: {},
		texturePacks: [],
		loadTexturePack,
		parseDictionaryQuery,
		getKey
	});
	const defaultTP = {};
	BCTPM.texturePacks[0] = defaultTP;

	function filterObject(obj) {
		let newObj = {};
		for (let key in obj) {
			//include arrays also
			if (typeof obj[key] == "object") {
				newObj[key] = filterObject(obj[key]); //surly it wont go too deep
				if (Object.keys(newObj[key]).length == 0) delete newObj[key];
			}
			if (typeof obj[key] == "string" && obj[key].endsWith(".png")) newObj[key] = obj[key];
		}
		return newObj;
	}

	function registerThing(type) {
		let plural = type + "s";
		defaultTP[plural] = {};
		BCTPM.dictionary[plural] = {};
		for (let i in BCTPM.world[plural]) {
			let item = BCTPM.world[plural][i];
			let itemId = item[type + "Id"];
			BCTPM.dictionary[plural][itemId] = Number(i);
			defaultTP[plural][itemId] = item;
		}
	}

	function getKey(type, key) {
		if (!type) return key;
		var i = BCTPM.dictionary[type][key];
		return isNaN(i) ? key : i;
	}

	function parseDictionaryQuery(query) {
		if (typeof query != "string" || !query.startsWith("default.")) return query;
		query = query.split("."); query.shift();
		let current = defaultTP;
		for (let part of query) {
			if (typeof current !== "object") throw "This is not an object";
			current = current[part];
			if (!current) throw "This key (" + part + ") does not exist";
		}
		return current;
	}

	function objMap(target, cb = (target, value, key, keyHistory, source) => target, source = target, keyHistory = []) {
		for (let key in source) {
			let value = source[key];
			if (typeof value == "object") //Merge source[key] into target[key]
				value = objMap(target[key] || {}, cb, value, [...keyHistory, key]);
			target = cb(target, value, key, keyHistory, source);
		}
		return target;
	}

	function loadTexturePack(tp) {
		//Merge TexturePacks

		tp = Object.assign({}, tp);
		//delete Uneeded keys
		let deleteKeys = ["name", "author", "date", "description"];
		for (let key of deleteKeys) delete tp[key];

		// replace default. text
		tp = objMap({}, (target, value, key, keyHistory) => {
			if (keyHistory.length > 0) key = getKey(keyHistory[0], key);
			target[key] = parseDictionaryQuery(value);
			return target;
		}, tp);

		BCTPM.log("Loading Texture Pack", tp);
		objMap(world, (target, value, key, keyHistory, source) => {
			target[key] = value;
			return target;
		}, tp);
		/*objMap(tp, (world, value, key, tp, h) => {
			if (h.length > 1) key = getKey(h[1], key);
			world[key] = value;
		}, world);*/
	}

	if (typeof cardboard !== undefined) {
		cardboard.on("worldCreated", world => {
			BCTPM.log("World Created");
			BCTPM.world = world;
		});
		cardboard.on("login", () => {
			Object.assign(defaultTP, {
				name: "Box Critters",
				author: "RocketSnail",
				date: new Date(1564832528955),
				description: "This is the classical look of Box Critters"
			});
			registerThing("item");
			registerThing("room");
			registerThing("critter");


			//defaultTP = Object.assign({}, BCTPM.world);
		});
	}
	if (typeof Critterguration !== undefined) {
		var settings = Critterguration.registerSettingsMenu(BCTPM);
		settings.innerText = "Coming soon";
	}

	window.BCTPM = BCTPM;
})();