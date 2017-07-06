$(document).ready(function() {
	initializeSavedDetails();
});

$('#save-btn').click(function() {
	var b = {};
	var userData = {
			'apiKey': $('#api-key').val(),
			'secretKey': $('#secret-key').val()
	}

	b['userData'] = userData;
	chrome.storage.local.set(b);
	window.prompt("Captcha Solutions", "KEYS SUCCESSFULLY SAVED!");
});

function initializeSavedDetails() {
	chrome.storage.local.get('userData', initializeUserDataControls);
}

function initializeUserDataControls(a) {
	if (a && (a = a['userData'])) {
		$('#api-key').val(a.apiKey);
		$('#secret-key').val(a.secretKey);
	}
}
