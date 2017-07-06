// region independent functions
	String.prototype.lpad = function(padString, length) {
		var str = this;
		while (str.length < length)
			str = padString + str;
		return str;
	}

	function isAcceptableInaccessibleFrame(src) {
		if (!rumola_prefs.filters[2].test(src))
			return false;
		return true;
	}

	function getURL(s) {
		return chrome.extension.getURL(s);
	}

	function hashCode(s) {
		var hash = 0;
		if (s.length == 0) return hash;
		for (i = 0; i < s.length; i++) {
			ch = s.charCodeAt(i);
			hash = ((hash<<5)-hash)+ch;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}

	function input_checks(e) {
		try	{
			var r = e.name;
			if (!r)
				r = e.id;
			if (!r)
				r = "#"+e.className;
			if (!r)
				return false;
			if (r.length > 250)
				return false;
			if (r.indexOf('||') != -1)
				return false;
			return "||T:"+r;
		} catch(exception) {}
		return false;
	}

	function acceptable_input_type(type, is_for_context_menu) {
		if (type == "tel")
			return true;
		if (type == "text")
			return true;

		if (type == "button")
			return false;
		if (type == "checkbox")
			return false;
		if (type == "file")
			return false;
		if (type == "hidden")
			return false;
		if (type == "image")
			return false;
		if (type == "radio")
			return false;
		if (type == "reset")
			return false;
		if (type == "submit")
			return false;
		if (is_for_context_menu)
			return true;

		return false;
	}

	function image_checks(e) {
		try
		{
			if (!e.src)
				return false;
			if (e.src.length > 2048)
				return false;
			if (e.src.length < 5)
				return false;
			if (e.src.match(/^data:/))
				return false;
			if (e.src.indexOf('||') != -1)
				return false;
			if (!e.style)
				return false;
			if (e.style.visibility == 'hidden')
				return false;
			if (e.style.display == 'none')
				return false;
			if (!e.complete)
				return "||I:"+e.src;
			if (e.width <= 5)
				return false;
			if (e.width >= 650)
				return false;
			if (e.height < 5)
				return false;
			if (e.height > 250)
				return false;
			return "||I:"+e.src;
		} catch(exception) {}
		return false;
	}

	function object_checks(f) {
		// TODO: flash can be described by other ways
		if (f.type != 'application/x-shockwave-flash')
			return false;
		if (!rumola_prefs.filters[1].test(f.data))
			return false;
		return "||O:"+f.data;
	}

	function initDocumentEventListener(w, a, b, c) {
		w.document.addEventListener(a, b, c);
		for (var i=0; i<w.frames.length; i++)
			if (isAccessibleChildFrame1(w.frames[i]))
				initDocumentEventListener(w.frames[i], a, b, c);
	}

	function isAccessibleChildFrame1(f) {
		// TODO: here is a problem. How to no to generate error in Chrome?
		try
		{
			if (f.document && (f.document.readyState === "complete")) {
				return true;
			}
		}
		catch (e) {}
		return false;
	}

	function isAccessibleChildFrame(w) {
		// TODO: here is a problem. How to no to generate error in Chrome?
		try
		{
			if (w.contentDocument && (w.contentDocument.readyState === "complete")) {
				return true;
			}
		}
		catch (e) {}
		return false;
	}

	function isAccessibleParentFrame(w) {
		// TODO: here is a problem. How to no to generate error in Chrome?
		try
		{
			if (w.document) {
				return true;
			}
		}
		catch (e) {}
		return false;
	}

	function getFormId(f) {
		if (!f.rumola_form_id)
			f.rumola_form_id = ++rumola.document.max_form_id;
		return f.rumola_form_id;
	}

	function newFormId(f) {
		f.rumola_form_id = ++rumola.document.max_form_id;
		return f.rumola_form_id;
	}

	function get_zero_from_tag() {
		return ++rumola.document.zero_form_tag;
	}

	function rumola_handleContextMenu(event) {
		var element = event.target;
		rumola_prefs.last_context_element = element;
//		chrome.extension.sendRequest({action: "SetContextMenuFrameId", frame_id: rumola.frame_id});	
	}

	function dropevent(e) {
	try
	{
		var el = e.target;
		if (el.tagName != 'INPUT')
			return;
		if (!acceptable_input_type(el.type, true))
			return;
		if (rumola_prefs.last_dragged_element.tagName != 'IMG')
			return;

		var u = "url("+getURL("images/pen_w.gif")+")";
		var t_field_style = {bi_important:el.style.getPropertyPriority("background-image"), bi_value:el.style.removeProperty("background-image"),
			br_important:el.style.getPropertyPriority("background-repeat"), br_value:el.style.removeProperty("background-repeat")};
		el.style.setProperty("background-image", u, "important");
		el.style.setProperty("background-repeat", "no-repeat", "important");

		var drope = null;
		var dragl = function(e) {
			el.style.removeProperty("background-image");
			el.style.setProperty("background-image", t_field_style.bi_value, t_field_style.bi_important);
			el.style.removeProperty("background-repeat");
			el.style.setProperty("background-repeat", t_field_style.br_value, t_field_style.br_important);
			el.removeEventListener("dragleave", dragl, true);
			el.removeEventListener("drop", drope, true);
		}
		el.addEventListener("dragleave", dragl, true);

		drope = function(e) {
		try
		{
			el.removeEventListener("drop", drope, true);
			e.stopPropagation();
			e.preventDefault();
			dragl(e);
			for (var i=0; i<rumola.document.my_forms.length; i++) {
				if ((rumola.document.my_forms[i] instanceof rumola_form_ready)&&(rumola.document.my_forms[i].is_captcha_image(rumola_prefs.last_dragged_element, true))) {
					if (!rumola.document.my_forms[i].is_captcha_input(e.target))
						rumola.document.my_forms[i].change_t_field(e.target);
					rumola.document.start_solve(i);
					return;
				}
			}
			rumola.document.apply_simple_mode(rumola_prefs.last_dragged_element, e.target);
		}
		catch (exc) {rumola_notifications.send_exception(1133, exc);}
		}
		el.addEventListener("drop", drope, true);
	}
	catch (exc) {rumola_notifications.send_exception(1215, exc);}
	}

	function dragevent(event) {
		var element = event.target;
		rumola_prefs.last_dragged_element = element;
	}

	function windowWidth() {
		var docElemProp = window.document.documentElement.clientWidth,
			body = window.document.body;
		return window.document.compatMode === "CSS1Compat" && docElemProp || body && body.clientWidth || docElemProp;
	}

	function windowHeight() {
		var docElemProp = window.document.documentElement.clientHeight,
			body = window.document.body;
		return window.document.compatMode === "CSS1Compat" && docElemProp || body && body.clientHeight || docElemProp;
	}
// endregion independent functions
