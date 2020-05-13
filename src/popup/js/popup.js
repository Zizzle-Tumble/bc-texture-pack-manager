
		sendMessageBG("getTab").then(msg => {
			switch(msg) {
				case 0:
					window.location.href = "themelist.html";
					break;
				case 1:
					window.location.href = "shaderlist.html";
					break;
				case 2:
					window.location.href = "options.html";
					break;
			}
		})