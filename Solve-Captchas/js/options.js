$(document).ready(function() {
	initializeSavedDetails();
});

$('#save-btn').click(function() {
	var b = {};
	var userData = {
			'apiKey': $('#api-key').val()
	}

	b['userData'] = userData;
	chrome.storage.local.set(b);
	window.prompt("Solve Captchas", "API KEY SUCCESSFULLY SAVED!");
});

function initializeSavedDetails() {
	chrome.storage.local.get('userData', initializeUserDataControls);
}

function initializeUserDataControls(a) {
	if (a && (a = a['userData'])) {
		$('#api-key').val(a.apiKey);
	}
}
