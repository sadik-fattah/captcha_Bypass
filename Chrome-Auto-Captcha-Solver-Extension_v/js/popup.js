document.addEventListener("DOMContentLoaded", function() {
	var a = document.getElementById("captcha-solutions");
	a && a.addEventListener("change", enableDisable);
    chrome.storage.local.get("captchaSolutionsEnable",
        initializeCaptchaSolutions);
});

var enabled = false;

function getCaptchaSolutionsEnabled() {
	chrome.storage.local.get('captchaSolutionsEnable', getCaptchaEnabled);
	return enabled;
}

function getCaptchaEnabled(a) {
	enabled = (a && (n = a.captchaSolutionsEnable));
}

function enableDisable() {
	getCaptchaSolutionsEnabled();
	var a = document.getElementById("captcha-solutions");
	a && chrome.storage.local.set({
		captchaSolutionsEnable: a.checked
	})
}

function initializeCaptchaSolutions(a) {
    var b = !1;
    a && (b = a.captchaSolutionsEnable);
    if (a = document.getElementById("captcha-solutions"))
        void 0 == b ? (chrome.storage.local.set({
        	captchaSolutionsEnable: !0
        }), a.checked = !0) : a.checked = b ? !0 : !1
}

document.getElementById('options-btn').onclick = function() {
	var options_url;
	options_url = chrome.extension.getURL('/forms/options.html');
	chrome.tabs.query({
		url: options_url
	}, function(tabs) {
		var props, _ref;
		if (tabs.length > 0) {
			props = {
					active: true
			};
			props.url = options_url;
			chrome.tabs.update(tabs[0].id, props);
			window.close();
		} else {
			chrome.tabs.getSelected(null, function(tab) {
				if('chrome://newtab/' === tab.url) {
					props = {
							active: true
					};
					props.url = options_url;
					chrome.tabs.update(tab.id, props);
					window.close();
				} else {
					chrome.tabs.create({
						url: options_url
					});
				}
			});
		}
	});
}