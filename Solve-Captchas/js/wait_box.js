var wait_box = {
	div: null,
	target: null,

	create_wait_div: function() {
		// ignore frameset, but:
		// v1: window == top and document.body instanceof HTMLFrameSetElement and rumola script injected to top
		// v2: window == top and document.body instanceof HTMLFrameSetElement and rumola script not injected to top
		if (window == top) {
			wait_box._create_wait_div();
			return;
		}
		top.postMessage({u: rumola_prefs.wait_box_unique_message_id, v: "show"}, "*");
	},

	hide_wait_div: function() {
		if (window == top) {
			wait_box._hide_wait_div();
			return;
		}
		top.postMessage({u: rumola_prefs.wait_box_unique_message_id, v: "hide"}, "*");
	},

	_create_wait_div: function() {
		if (wait_box.div)
			return false;

		// TODO: fix it
		if (window.document.body instanceof HTMLFrameSetElement)
			return false;

		wait_box.div = document.createElement('div');
		wait_box.div.setAttribute("id", "B2C54724019B");
		wait_box.div.setAttribute("className", "B8C34724019B");
		wait_box.div.innerHTML = '<div class="BCC34724019B" id="A5D44724019B"></div><div class="C3C34724019B"><div class="AF8A4824019B" style="clear: both; margin: 50px 30px;"><span class="C4C34724019B" id="E6D44724019B"></span><fieldset><div class="DDBD4724019B"><img src="'+getURL("images/wait.png")+'" alt=""/></div><div class="C5C34724019B"><img src="'+getURL("images/loader.gif")+'" alt=""/></div><div class="B627BBE59B18"><img id="AF976188709B" style="cursor:pointer" src="'+getURL("images/switcher_"+rumola_prefs.switcher_position+".png")+'" title="Click to switch"/></div><div class="CBC34724019B"><input type="button" value="Cancel" id="F8D54724019B"/></div></fieldset></div></div></div>';
		document.body.appendChild(wait_box.div);
		document.getElementById("A5D44724019B").style.setProperty("background", "url('"+getURL("images/overlay.png")+"')", "");
		document.getElementById("E6D44724019B").style.setProperty("background", "url('"+getURL("images/close.png")+"') no-repeat", "");
		wait_box.div.addEventListener("click", wait_box._click, true);
		return true;
	},

	_hide_wait_div: function() {
		if (!wait_box.div)
			return false;

		document.body.removeChild(wait_box.div);
		wait_box.div.removeEventListener("click", wait_box._click, true);
		wait_box.div = null;
		wait_box.target = null;
		return true;
	},

	_click: function(e) {
		e.preventDefault();
		e.stopPropagation();
		switch (e.target.id) {
			case "AF976188709B": // switcher
				var src = e.target.src;
				var p = src.length-5;
				var v = rumola_prefs.change_switcher_pos(src.charAt(p));
				e.target.src = src.substr(0, p) + v + src.substr(p+1);
				rumola_prefs.switcher_position = v;
				if (wait_box.target)
						wait_box.target.postMessage({u: rumola_prefs.wait_box_unique_message_id, v: "switcher_changed", p: rumola_prefs.switcher_position}, "*");
				break;
			case "E6D44724019B": // X
			case "F8D54724019B": // cancel
			case "A5D44724019B": // out of box area
				if (wait_box.target)
					wait_box.target.postMessage({u: rumola_prefs.wait_box_unique_message_id, v: "cancelled"}, "*");
				else
					rumola.document.wait_events = null;
				wait_box._hide_wait_div();
		}
	},

	_got_message: function(e) {
		if (!rumola_prefs.wait_box_unique_message_id)
			return;

	try
	{
		if (e.data.u == rumola_prefs.wait_box_unique_message_id) {
			e.preventDefault();
			e.stopPropagation();

			switch (e.data.v) {
				case "show":
					if (wait_box._create_wait_div()) {
						wait_box.target = e.target;
						wait_box.target.postMessage({u: rumola_prefs.wait_box_unique_message_id, v: "switcher_changed", p: rumola_prefs.switcher_position}, "*");
					} else {
						e.target.postMessage({u: rumola_prefs.wait_box_unique_message_id, v: "cancelled"}, "*");
					}
					break;
				case "hide":
					if (wait_box.target == e.target)
						wait_box._hide_wait_div();
					break;
				case "switcher_changed":
					rumola_prefs.switcher_position = e.data.p;
					break;
				case "cancelled":
					rumola.document.wait_events = null;
			}
		}
	}
	catch (exc) {rumola_notifications.send_exception(1778, exc);}
	}
};