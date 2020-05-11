function save_options() {
  }

  
	sendMessageBG("setTab",2);
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  async function restore_options() {
		var data = await sendMessageBG("getdata");
		$('#data').val(JSON.stringify(data,null,2));
		var rules = await sendMessageBG("getrules");
		$('#rules').val(JSON.stringify(rules,null,2));
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
	  save_options);