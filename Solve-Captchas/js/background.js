//Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
	if(details.reason == "install") {
		chrome.storage.local.set({
			captchaSolutionsEnable: true
		});
		getCaptchaSolutionsEnabled();
		chrome.tabs.create({url: "forms/options.html"});
	} 
//	else if(details.reason == "update"){
//	var thisVersion = chrome.runtime.getManifest().version;
//	console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
//	}
});


//region key functions
function get_rumola_key1() {
	var key = "db7669d04f6430b5";
	if (localStorage['rumola:key'])
		key = (""+localStorage['rumola:key']).substr(0,16);
	return key;
}
function get_rumola_key2() {
	var key = "edf384db051f5d18";
	if (localStorage['rumola:key'])
		key = (""+localStorage['rumola:key']).substr(16);
	return key;
}
function get_rumola_key2_sum() {
	var key = get_rumola_key2();
	var s=0;
	for (var i=0; i<16; i++) {
		s += key.charCodeAt(i);
	}
	return s;
}

function set_rumola_key(key) {
	localStorage['rumola:key'] = key;
}
//endregion key functions

var enabled = false;

function getCaptchaSolutionsEnabled() {
	return true;
//	if(flag) {
//	return enabled;
//	}
////	chrome.storage.local.get('captchaSolutionsEnable', getCaptchaEnabled);
////	return enabled;
//	chrome.storage.local.get('captchaSolutionsEnable', function (result) {
//	enabled = result && result.captchaSolutionsEnable;
////	getCaptchaSolutionsEnabled(true);
//	});

////	return enabled;
}

function getCaptchaEnabled(a) {
	enabled = a && a.captchaSolutionsEnable;
}


//region auto search functions
function get_rumola_enabled() {
	var enabled = true;
	if (localStorage['rumola:enabled'])
		enabled = (localStorage['rumola:enabled'] == 'true');
	return enabled;
}
function set_rumola_enabled(enabled) {
	localStorage['rumola:enabled'] = enabled ? "true" : "false";
//	chrome.browserAction.setIcon({"path": (enabled ? "images/on.png" : "images/off.png")});
//	chrome.browserAction.setTitle({"title": chrome.i18n.getMessage(enabled ? "hint1" : "hint2")});
}
function change_rumola_enabled() {
	var enabled = !get_rumola_enabled();
	set_rumola_enabled(enabled);
	if (!enabled) {
		// TODO: may be make function sendMessage like in Safari
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id, {action:"Cancel"});
		});
	}
}
//endregion auto search functions
set_rumola_enabled(get_rumola_enabled());

//region voice notifications
function get_rumola_voice() {
	var voice = false;
	if (localStorage['rumola:voice'])
		voice = (localStorage['rumola:voice'] == 'true');
	return voice;
}
function set_rumola_voice(v) {
	var value = v ? "true" : "false";
	localStorage['rumola:voice'] = value;
	if (v) {
		voice_notification("notifications/on.wav");
		notify(chrome.i18n.getMessage("voice_on"), false);
	} else {
		notify(chrome.i18n.getMessage("voice_off"), false);
	}
}

audio_object = null;
function voice_notification(f) {
	if (!get_rumola_voice())
		return;
	try
	{
		if (audio_object === null)
		{
			audio_object = new Audio();
		}
		audio_object.src = f;
		audio_object.play();
	}
	catch (exc) {}
}
//endregion voice notifications

//region switcher position
function get_switcher_position() {
	var pos = 'p';
	if (localStorage['rumola:switcher'])
		pos = localStorage['rumola:switcher'];
	return pos;
}
//endregion switcher position

//region of captcha regexes
function get_regexes_string() {	
	//var line = "recaptcha_challenge_image|recaptcha_image|[ck]apt?cha|capt?cha|CAPT?CHA|imgCaptcha|.+?image\?c.+?||solvemedia|object||solvemedia|iframe|frame||capt?cha|CAPT?CHA|IdMainDiv|realperson|recaptcha_image||capt?cha|recaptcha_image|CAPT?CHA||[ck]ap|chal|check|code|kod|confir|response|secur|solu|token|validat|verif|vrfcd|result|txtCaptcha|respuesta|captcha||Turing|iframe|frame";
	var line = "[ck]apt?cha|capt?cha|secur?image|CAPT?CHA|Captcha?|robot|random|rnd|code|kod|geraimag|verif|recaptcha.*api.*?image|recaptcha_image|image|reCAPTCHA.+?|imgCaptcha|.+?image\?c.+?||solvemedia||iframe|solvemedia||capt?cha|IdMainDiv|realperson||capt?cha||[ck]ap|chal|check|code|kod|confir|guess|guven|ivc|response|secur|solu|spam|test|token|validat|verif|vrfcd|result|respuesta|captchas|captcha?code|[a-zA-Z0-0]*?Captcha||logo";
	//if (localStorage['rumola:filter_string_new']) {
	//	line = localStorage['rumola:filter_string_new'];
	//}
	
	// 0 - img  | [ck]apt?cha|robot|random|rnd|code|kod|geraimag|verif|captcha|recaptcha|CAPTCHA
	// 1 - object | solvemedia
	// 2 - frame | solvemedia
	// 3 - label/div  | capt?cha|IdMainDiv|realperson
	// 4 - div        | capt?cha
	// 5 - input    | [ck]ap|chal|check|code|kod|confir|guess|guven|ivc|response|secur|solu|spam|test|token|validat|verif|vrfcd|result|respuesta|captcha|Turing|Captcha|captchas
	// 6 - image anti regex
	//var line = "[ck]apt?cha|robot|random|rnd|code|kod|geraimag|verif|captcha|recaptcha|CAPTCHA|captcha|src||solvemedia||solvemedia||capt?cha|CAPT?CHA|IdMainDiv|realperson||capt?cha||[ck]ap|chal|check|code|kod|confir|guess|guven|ivc|response|secur|solu|spam|test|token|validat|verif|vrfcd|result|respuesta||Turing|captchas|CAPTCHA";
	
	return line;
}
function get_regexes_version() {
	var v = 5;
	if (localStorage['rumola:filter_version_new'])
		v = localStorage['rumola:filter_version_new'];
	return v;
}
function set_regexes_string_and_version(s, v) {		
	localStorage['rumola:filter_string_new'] = s;
	localStorage['rumola:filter_version_new'] = parseInt(v);
}
//endregion of captcha regexes

//region cached balance functions
function get_cached_balance() {
	var balance = "?";
	if (localStorage['rumola:balance'])
		balance = ""+localStorage['rumola:balance'];
	return balance;
}
function update_cached_balance(b) {
	localStorage['rumola:balance'] = b;
}
//endregion cached balance functions

//region all connect to server functions
gate_urls = new Array();
gate_urls.push("https://gate1a.skipinput.com/q_gate.php?b=chrome&v=3005&l="+chrome.i18n.getMessage("@@ui_locale")+"&key=");
gate_urls.push("https://gate2a.skipinput.com/q_gate.php?b=chrome&v=3005&l="+chrome.i18n.getMessage("@@ui_locale")+"&key=");
gate_urls.push("https://gate.rumola.com/q_gate.php?b=chrome&v=3005&l="+chrome.i18n.getMessage("@@ui_locale")+"&key=");

tmp_variable = Math.round((new Date()).getTime()/100);
gate_url_index = (get_rumola_key1() == 'db7669d04f6430b5') ? 0 : tmp_variable % 3;
gate_url_vector = (tmp_variable % 2)*2-1;
gate_suggested_index = -1;
gate_url = gate_urls[gate_url_index];
n_bad_responses_from_first_gate = 0;

function change_rumola_gate_url(bNotify, bUseSuggested) {
	if (bNotify)
		n_bad_responses_from_first_gate++;
	if ((n_bad_responses_from_first_gate == 3)&&(bNotify)) {
		notify(chrome.i18n.getMessage("conn_error"), false);
	}
	if (get_rumola_key1() == 'db7669d04f6430b5') {
		return;
	}
	gate_url_index = bUseSuggested ? gate_suggested_index : ((gate_url_index+gate_url_vector+6) % 3);
	gate_url = gate_urls[gate_url_index];
}

function process_response_heads(objHTTP) {
	if (objHTTP.getResponseHeader("rumola_key"))
		set_rumola_key(objHTTP.getResponseHeader("rumola_key"));
	if (objHTTP.getResponseHeader("rumola_credits"))
		update_cached_balance(objHTTP.getResponseHeader("rumola_credits"));
	if (objHTTP.getResponseHeader("DraftFilterVersion") && objHTTP.getResponseHeader("DraftFilterString"))
		set_regexes_string_and_version(objHTTP.getResponseHeader("DraftFilterString"), objHTTP.getResponseHeader("DraftFilterVersion"));
	if (objHTTP.getResponseHeader("ChangeGateSuggest") && (gate_suggested_index == -1)) {
		gate_suggested_index = parseInt(objHTTP.getResponseHeader("ChangeGateSuggest"));
		change_rumola_gate_url(false, true);
	}
}

function send_activation_request(post_data, tab_id, frame_id) {
	var objHTTP = new XMLHttpRequest();
	objHTTP.sender_tab_id = tab_id;
	objHTTP.frame_id = frame_id;
	objHTTP.open('POST', gate_url+get_rumola_key1()+"&action=install&c1="+check_cheater_1()+"&c2="+check_cheater_2(), false);
	objHTTP.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	try
	{
		objHTTP.send(post_data);
	}
	catch (exc) {
		notify(chrome.i18n.getMessage("conn_error"), false);
		return false;
	}
	if (objHTTP.status != 200) {
		notify(chrome.i18n.getMessage("conn_error"), false);
		return false;
	}
	process_response_heads(objHTTP);
	if (get_rumola_key1() == 'db7669d04f6430b5') {
		notify(chrome.i18n.getMessage("conn_error"), false);
		return false;
	}
	process_good_response_from_first_gate(""+objHTTP.responseText, objHTTP.sender_tab_id, objHTTP.frame_id, objHTTP.getResponseHeader("BGate"));
	return true;
}

function send_request_to_first_gate(toGate, tab_id, frame_id, step_id) {
	var regex = new Array();

	var regexArray = get_regexes_string().split('||');
	for (var i=0; i<regexArray.length; i++) {
		regex[i] = new RegExp(regexArray[i]);
	}

	if(toGate) {
		var lines = toGate.split('\n');
		var zero = null;
		var first = null;
		var inputIndex = -1;
		var captchaIndex = -1;
		// iterate each line
		for(var i = 0; i < lines.length; i++) {
			if(!lines[i]) {
				continue;
			}
			var tags = lines[i].split('||');
			if(tags && tags.length > 2) {
				for(var j = 2; j < tags.length; j++) {
					if(tags[j].substring(0, 2) == 'T:') {
						if(regex[5].test(tags[j])) {
							inputIndex = j - 2;
							continue;
						}
					} else if(tags[j].substring(0, 2) == 'I:') {
						if(regex[0].test(tags[j]) && !regex[6].test(tags[j])) {
							captchaIndex = j - 2;
							continue;
						}
					}
				}
			}
			if(inputIndex != -1 && captchaIndex != -1) {
				zero = tags[0];
				first = tags[1];
			} else {
				zero = null;
				first = null;
				inputIndex = -1;
				captchaIndex = -1;
			}

			if(inputIndex > -1 && captchaIndex > -1 && zero && first) {
				break;
			}
		}

		// if t_field and i_field not found in one form, try to find in different forms
		if(inputIndex == -1 && captchaIndex == -1 && !zero && !first) {
			for(var i = 0; i < lines.length; i++) {
				if(!lines[i]) {
					continue;
				}
				var tags = lines[i].split('||');
				if(tags && tags.length > 2) {
					for(var j = 2; j < tags.length; j++) {

						if(tags[j].substring(0, 2) == 'T:') {
							if(regex[5].test(tags[j])) {
								//inputIndex = j - 2;
								if(captchaIndex > -1) {
									inputIndex = captchaIndex + 1;
								} else {
									inputIndex = j - 2;
								}
								if((!zero && !first) || first > tags[1]) {
									zero = tags[0];
									first = tags[1];
								}
								continue;
							}
						} else if(tags[j].substring(0, 2) == 'I:') {
							if(regex[0].test(tags[j]) && !regex[6].test(tags[j])) {
								if(inputIndex > -1) {
									captchaIndex = inputIndex + 1;
								} else {
									captchaIndex = j - 2;
								}
								if((!zero && !first) || first > tags[1]) {
									zero = tags[0];
									first = tags[1];
								} 
								continue;
							}
						}
					}
				}
			}

		}

		var data = '|CAPTCHA(s) NOT found on this page.';
		if(inputIndex > -1 && captchaIndex > -1 && zero && first) {
			data = '|CAPTCHA(s) found on this page. \n Trying to solve it.||' + zero + '||' + first + '||' + inputIndex + '||' + captchaIndex + '||vQVMBh';
			process_good_response_from_first_gate(data, tab_id, frame_id, 'https://gate1a.skipinput.com/b_gate.php?b=chrome&v=3005&key=');
		}
	}
}

function response_from_first_gate(aEvent) {
	var objHTTP = aEvent.target;
	if (objHTTP.readyState != 4)
		return;
	if (objHTTP.status != 200) {
		if (objHTTP.gate_url == gate_url) {
			change_rumola_gate_url(true, false);
		}
		if (objHTTP.step_id == 1) {
			setTimeout(function() {
				send_request_to_first_gate(objHTTP.toGate, objHTTP.sender_tab_id, objHTTP.frame_id, 2);
			}, 250);
		}
		return;
	}
	process_response_heads(objHTTP);
	process_good_response_from_first_gate(""+objHTTP.responseText, objHTTP.sender_tab_id, objHTTP.frame_id, objHTTP.getResponseHeader("BGate"));
}
function response_from_second_gate(aEvent) {
	var objHTTP = aEvent.target;
	if (objHTTP.readyState != 4)
		return;

	if (objHTTP.status != 200 || (objHTTP.responseText != null && objHTTP.responseText.indexOf('Error:') > -1)) {
		if (objHTTP.redo && objHTTP.redo < 4) {
			setTimeout(function() {

				var objHTTP1 = new XMLHttpRequest();

				objHTTP1.sender_tab_id = objHTTP.sender_tab_id;
				objHTTP1.frame_id = objHTTP.frame_id;
				objHTTP1.method = objHTTP.method;
				objHTTP1.url = objHTTP.url;
				objHTTP1.data = objHTTP.data;

				objHTTP1.redo = objHTTP.redo + 1;

				objHTTP1.open(objHTTP.method, endpoint, true);    // plug-in desired URL

				objHTTP1.addEventListener("readystatechange", response_from_second_gate, true);

				var params = "pict=" + encodeURIComponent('data:image/png;base64,' + objHTTP.data) + "&function=extension&key=" + key;

				objHTTP1.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				objHTTP1.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");

				objHTTP1.send(params);

			}, 3000);
			return;
		}
	}

	var parseXml;

	if (typeof window.DOMParser != "undefined") {
		parseXml = function(xmlStr) {
			return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
		};
	} else if (typeof window.ActiveXObject != "undefined" &&
			new window.ActiveXObject("Microsoft.XMLDOM")) {
		parseXml = function(xmlStr) {
			var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(xmlStr);
			return xmlDoc;
		};
	} else {
		throw new Error("No XML parser found");
	}

	var solved = null;
	var xml = parseXml(replaceAll(objHTTP.responseText, '&', ''));
	solved = xml.documentElement.getElementsByTagName("decaptcha")[0].firstChild.nodeValue;

	var tagsStr = 'Solve Captchas|';
	if(solved && solved.indexOf('Error:') > -1) {
		if(solved.trim() === 'Error: You don\'t have any active membership subscription plans.') {
			tagsStr = tagsStr + solved.trim() + ' You can subscribe any  of these <a href="https://www.solvecaptchas.com/#order">packaged plans</a>';	
		} else {
			tagsStr = tagsStr + solved.trim();	
		}
		solved = null;
	} else if(solved && solved.indexOf('Error:') === -1) {
		solved = solved.trim();
	} else {
		solved = null;
	}

	if(solved) {
		tagsStr = tagsStr + 'entered the CAPTCHA characters for you.||' + objHTTP.frame_id + '||0||OK||||' + solved;
	} else {
		tagsStr = tagsStr;
	}

	if(tagsStr.indexOf('Error:') > -1) {
		notify(tagsStr, false);
		chrome.tabs.sendRequest(objHTTP.sender_tab_id, {action:"Cancel"});
	} else {
		var tags = (tagsStr).split("||");
		chrome.tabs.get(objHTTP.sender_tab_id, function(ttt) {
			if (!ttt)
				return;

			if ((tags.length == 1)&&(tags[0])) {
				notify(tags[0]);
			}

			if (tags.length > 1) {
				chrome.tabs.sendRequest(objHTTP.sender_tab_id, {action:"ResponseFromSecondGate", tags:tags, frame_id:objHTTP.frame_id}, 
						function() {
					if (tags[0])
						notify(tags[0]);
				});
			}
		});
	}
}

function base64toBlob(b64Data, contentType, sliceSize) {
	contentType = contentType || '';
	sliceSize = sliceSize || 512;

	var byteCharacters = atob(b64Data);
	var byteArrays = [];

	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);

		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}

		var byteArray = new Uint8Array(byteNumbers);

		byteArrays.push(byteArray);
	}

	var blob = new Blob(byteArrays, {type: contentType});
	return blob;
}

function process_good_response_from_first_gate(data, tab_id, frame_id, b_gate_url) {
	n_bad_responses_from_first_gate = 0;
	var tags = data.split("||");

	if (tab_id == -1) {
		if (tags[0])
			notify(tags[0], false);
	} else {
		chrome.tabs.get(tab_id, function(ttt) {
			if (!ttt)
				return;

			if ((tags.length >= 1)&&(tags[0])) {
				if (tags.length == 6) {
					last_founded_captcha_tab_id = tab_id;
					last_founded_captcha_frame_id = frame_id;
				}
				notify(tags[0], tags.length == 6);
			}

			if (tags.length > 1) {
				chrome.tabs.sendRequest(tab_id, {action:"ResponseFromFirstGate", tags:tags, b_gate_url:b_gate_url, frame_id:frame_id});
			}
		});
	}
}

//endregion all connect to server functions

//region notifications + notification clicks functions
global_buttons = new Array();
last_founded_captcha_tab_id = -1;
last_founded_captcha_frame_id = null;
global_notify_counter = 0;
try
{
	chrome.notifications.onClicked.addListener(function(notificationId) {
		if (notificationId != 'RumolaNotification')
			return;
		chrome.notifications.clear("RumolaNotification", function(b) {});
		// TODO: solve captcha if last message was about captcha
	}); 
	chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
		if (notificationId != 'RumolaNotification')
			return;
		chrome.notifications.clear("RumolaNotification", function(b) {});
		if (global_buttons[buttonIndex]) {
			chrome.tabs.create({url:global_buttons[buttonIndex][3], "active":true});
			return;
		}
		chrome.tabs.sendRequest(last_founded_captcha_tab_id, {action:"StartLastCaptchaRecognition", frame_id:last_founded_captcha_frame_id});
	}); 
}
catch (exc) {}
function notify(s, need_solve_button) {
	var opt = {
			type: "basic",
			title: "Solve Captchas",
			message: "",
			iconUrl: "images/icons/48.png",
			buttons: new Array(),
	};
	global_buttons = new Array();
	var wait_time = 2600;
	var b = s.match(/{{[^}]+}}/g);
	if (b) {
		for (var i=0; i<b.length; i++) {
			var x = b[i].split("|");
			if (x[1] == "V") {
				voice_notification(x[2]);
			}
			if (x[1] == "T") {
				wait_time = parseInt(x[2]);
			}
			if (x[1] == "B") {
				if (x.length == 5)
					opt.buttons.push({title:x[2]});
				else
					opt.buttons.push({title:x[2], iconUrl:x[4]});
				global_buttons.push(x);
			}
		}
	}
	if (need_solve_button) {
		//opt.buttons.push({title:'Click to solve it now'});
	} else {
		last_founded_captcha_tab_id = -1;
	}
	s = s.replace(/{{[^}]+}}/g, '');
	var ts = s.split(/\|/);
	if (ts.length == 2) {
		opt.title = ts[0];
		opt.message = ts[1];
	} else {
		opt.message = s;
	}
	try
	{
		var local_notify_counter = ++global_notify_counter;
		chrome.notifications.create("RumolaNotification", opt, function(b) {});
		setTimeout(function() {
			if (local_notify_counter == global_notify_counter)
				chrome.notifications.clear("RumolaNotification", function(b) {}) 
		}, wait_time);
	}
	catch (exc) {
		var notification = webkitNotifications.createNotification(
				'images/icons/48.png',
				opt.title, opt.message);
		notification.show();
		setTimeout(function() {notification.cancel();}, (global_buttons.length == 0) ? 2300 : 30000);
	}
}
//endregion notifications + notification clicks functions

//****** abuses ****** //
function send_abuse(type, comm) {
	var value = (type == 1) ? get_abuse_captcha_params() : comm;
	if (!value)
		return;
	var objHTTP = new XMLHttpRequest();
	objHTTP.open('GET', "https://gate1a.skipinput.com/abuse_gate_new.php?b=chrome&v=3005&key="+get_rumola_key1()+"&a="+value, true);
	objHTTP.addEventListener("readystatechange", response_from_abuse_gate, true);
	objHTTP.send(null);
	if (type == 1) {
		localStorage["rumola:last_recognised_captcha_time"] = 0;
	}
}
function response_from_abuse_gate(aEvent) {
	var objHTTP = aEvent.target;
	if (objHTTP.readyState != 4)
		return;


	if (objHTTP.responseText) {
		notify(objHTTP.responseText);
	}
}
function get_abuse_captcha_params() {
	if (!localStorage["rumola:last_recognised_captcha_time"])
		return null;
	var t = localStorage["rumola:last_recognised_captcha_time"];
	var ct = (new Date()).getTime()/1000;
	if ((ct - 600) > t)
		return null;
	return escape(localStorage["rumola:last_recognised_captcha_id"] + ":" + localStorage["rumola:last_recognised_captcha_value"]);
}

//***** popup ***** //
function popup_clicked(t) {
	switch (t) {
	case 1: // AutoSearch
		// TODO: may be make function sendMessage like in Safari
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id, {action:"AutoSearch"});
		});
		break;
	case 2:	// Cancel
		// TODO: may be make function sendMessage like in Safari
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id, {action:"Cancel"});
		});
		break;
	case 3: // PageAbuse
		chrome.tabs.getSelected(null, function(tab) {
			var abused_url = tab.url;
			var comm=prompt("To send a complaint about "+abused_url, "Please enter a short description of what you were doing. This will help us understand the problem (optional)");
			if (comm !== null) {
				send_abuse(2, escape(abused_url)+"&c="+escape(comm));
			}
		});
		break;
	case 4: // CaptchaAbuse
		send_abuse(1, null);
		break;
	case 5: // visit website
		chrome.tabs.create({url:"http://skipinput.com/", "active":true});
		break;
	case 7: // purchase
		chrome.tabs.create({url:"https://client.skipinput.com/?k="+get_rumola_key1()+"&v="+get_rumola_key2_sum(), "active":true});
		break;
	case 8: // tie
		chrome.tabs.create({url:"https://client.skipinput.com/?a=t&k="+get_rumola_key1()+"&v="+get_rumola_key2_sum(), "active":true});
		break;
	case 9: // like
		chrome.tabs.create({url:"https://client.skipinput.com/like.php?k="+get_rumola_key1()+"&v="+get_rumola_key2_sum(), "active":true});
		break;
	}
}

//region active tab functions
active_tab_ids = new Array();
active_tab_err = false;
function tab_is_active(windowId, tabId) {
	if ((active_tab_ids[windowId] != null)&&(active_tab_ids[windowId] != tabId)) {
		chrome.tabs.sendRequest(active_tab_ids[windowId], {action:"JustDeactivated"});
	}
	active_tab_ids[windowId] = tabId;
	chrome.tabs.sendRequest(tabId, {action:"JustActivated"});
}
try
{
	chrome.tabs.onActivated.addListener(function(i) {
		tab_is_active(i.windowId, i.tabId);
	});
	chrome.tabs.query({"active":true}, function(tabs) {
		for (var i=0; i<tabs.length; i++) {
			tab_is_active(tabs[i].windowId, tabs[i].id);
		}
	});
}
catch (exc) {
	active_tab_err = true;
}
//endregion active tab functions

//region messages processing
wait_box_unique_message_id = "rumola_show_wait_box::"+(new Date()).getTime()+"::"+Math.random();
function receiveMessage(request, sender, sendResponse) {
	switch (request.action) {
	case "PleaseSendPrefs":
		sendResponse({enabled:getCaptchaSolutionsEnabled(), switcher_position:get_switcher_position(), filter_string: get_regexes_string(),
			wait_box_unique_message_id:wait_box_unique_message_id,
			b_active_tab:(active_tab_err ? false : (active_tab_ids[sender.tab.windowId] == sender.tab.id)),
			client_area_link:((get_rumola_key1() == 'db7669d04f6430b5') ? "" : "https://client.skipinput.com/?k="+get_rumola_key1()+"&v="+get_rumola_key2_sum())});
		break;
	case "RequestToFirstGate":
		send_request_to_first_gate(request.toGate, sender.tab.id, request.frame_id, 1);
		break;
	case "CaptureNow":
		chrome.tabs.captureVisibleTab(sender.tab.windowId, {format:"png"}, function(dataUrl) {
			sendResponse({dataUrl:dataUrl});
		});
		break;
	case "StartResolve":
		initializeSavedDetails();
		if(key) {
			setTimeout(function() {
				var formData = new FormData();
				var objHTTP = new XMLHttpRequest();

				objHTTP.sender_tab_id = sender.tab.id;
				objHTTP.frame_id = request.frame_id;
				objHTTP.method = request.method;
				objHTTP.url = request.url;
				objHTTP.data = request.data;
				objHTTP.redo = 1;
				// for sync call
				objHTTP.open(request.method, endpoint, true);    // plug-in desired URL

				objHTTP.addEventListener("readystatechange", response_from_second_gate, true);

				var params = "pict=" + encodeURIComponent('data:image/png;base64,' + request.data) + "&function=extension&key=" + key;
				objHTTP.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				objHTTP.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");

				objHTTP.send(params);
			}, 3000);
		} else {
			notify('Solve Captchas|please enter API key and secret key on the options page of the extension', false);
		}
		break;
	case "SaveCaptchaResult":
		localStorage["rumola:last_recognised_captcha_id"] = request.captcha_id;
		localStorage["rumola:last_recognised_captcha_value"] = request.value;
		localStorage["rumola:last_recognised_captcha_time"] = Math.round((new Date()).getTime()/1000);
		// no reply
		sendResponse({});
		break;
	case "PlaySound":
		voice_notification(request.file);
		break;
		// todo: create switcher position function
	case "SetSwitcherValue":
		var value = request.value == 'q' ? 'q' : 'p';
		localStorage['rumola:switcher'] = value;
		break;
	case "ChangeRumolaGateUrl":
		change_rumola_gate_url(false, false);
		// no reply
		sendResponse({});
		break;
	case "SetContextMenuFrameId":
		context_frame_id = request.frame_id;
		break;
	}
}

chrome.extension.onRequest.addListener(receiveMessage);
//endregion messages processing

//region context menu
context_frame_id = "";
function i_selected(info, tab) {
	chrome.tabs.sendRequest(tab.id, {action:"ISelected", frame_id:context_frame_id});
}
function t_selected(info, tab) {
	chrome.tabs.sendRequest(tab.id, {action:"TSelected", frame_id:context_frame_id});
}

//TODO: it will be good to make custom function for context
//context_menu_i_id = chrome.contextMenus.create({
//"title" : chrome.i18n.getMessage("context1"),
//"type" : "normal",
//"contexts" : ["image"],
//"onclick" : i_selected
//});
//context_menu_t_id = chrome.contextMenus.create({
//"title" : chrome.i18n.getMessage("context2"),
//"type" : "normal",
//"contexts" : ["editable"],
//"onclick" : t_selected
//});
//endregion context menu

var endpoint = "https://www.solvecaptchas.com/api/";
var key = null;
var secret = null;

initializeSavedDetails();

function initializeSavedDetails() {
	chrome.storage.local.get('userData', initializeUserDataControls);
}

function initializeUserDataControls(a) {
	if (a && (a = a['userData'])) {
		key = a.apiKey;
	}
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}
