function full_process_page(type, limit) { // type :: 0 - automatic, 1 - manual

	var ttt_struct = {
		selected_t_field: rumola.document.selected_t_field,
		selected_i_field: rumola.document.selected_i_field,
		have_good_fields: false,

		form_type: type,
		current_form_id:0,
		zero_shift:0,

		objects:Array(Array()),
		lines:Array(""),
		shifts:Array(""),
		forms:Array(""),

		deep:limit
	};

	var push_object = function(f) {
		ttt_struct.objects[ttt_struct.current_form_id].push(f);
		if (ttt_struct.current_form_id > 0)
			ttt_struct.objects[0].push(f);
		else
			ttt_struct.zero_shift++;
	}

	var isAcceptableField = function(f, win) {
		// i could not use instanceof because of different frames and window objects :(
		var x = null;
		if (f.tagName == 'INPUT') {
			if (f == ttt_struct.selected_t_field) {
				ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+"||F:b05911b84d9";
				push_object(f);
			} else if (acceptable_input_type(f.type, false) && (x = input_checks(f))) {
				if (rumola_prefs.filters[5].test(x))
					ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+x;
				push_object(f);
			}
			return true;
		}

		if (f.tagName == 'IMG') {
			if (f == ttt_struct.selected_i_field) {
				ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+"||C:b05911b84d9";
				push_object(f);
			} else if (x = image_checks(f)) {
				if (rumola_prefs.filters[0].test(x))
					ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+x;
				push_object(f);
			}
			return true;
		}

		if (f.tagName == 'OBJECT') {
			if (top != window)
				return true;
			x = object_checks(f);
			if (x) {
				ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+x;
				push_object(f);
			}
			return true;
		}

		if (((f.tagName == 'IFRAME')||(f.tagName == 'FRAME'))&&(!isAccessibleChildFrame(f))) {
			if (top != window)
				return true;
			if (isAcceptableInaccessibleFrame(f.src)) {
				ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+"||W:"+f.src;
				push_object(f);
			}
			return true;
		}

		if (f.tagName == 'DIV') {
			// TODO: this is a temporary limit
			if (top != window)
				return false;
			x = f.style.getPropertyValue("background-image") || win.getComputedStyle(f, null).getPropertyValue("background-image");
			if (rumola_prefs.filters[4].test(x)) {
				ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+"||D:"+x;
				push_object(f);
			} else if (rumola_prefs.filters[3].test(f.id)) {
				ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+"||R:"+f.id;
				push_object(f);
			} else if (rumola_prefs.filters[3].test(f.className)) {
				ttt_struct.have_good_fields = true;
				ttt_struct.lines[ttt_struct.current_form_id] = ttt_struct.lines[ttt_struct.current_form_id]+"||R:"+f.className;
				push_object(f);
			}
			return false; // we need to go inside div
		}

		return false;
	}

	var ttt = function(e, win) {
		if (--ttt_struct.deep < 0)
			return;
		if (!e || !e.childNodes)
			return;
		for (var i=0; i < e.childNodes.length; i++) {
			if (!isAcceptableField(e.childNodes[i], win)) {
				if ((e.childNodes[i] instanceof win.HTMLIFrameElement)||(e.childNodes[i] instanceof win.HTMLFrameElement)) { // TODO: check win. is ok?
					ttt(e.childNodes[i].contentDocument.body, e.childNodes[i].contentWindow);
				} else if ((e.childNodes[i].tagName == 'FORM' /* instanceof win.HTMLFormElement */) && (ttt_struct.form_type != 1 /* DO NOT IGNORE FORMS */)) { // wtf with instanceof ?
					ttt_struct.current_form_id = getFormId(e.childNodes[i]);
					ttt_struct.objects[ttt_struct.current_form_id] = new Array();
					ttt_struct.lines[ttt_struct.current_form_id] = "";
					ttt_struct.forms[ttt_struct.current_form_id] = e.childNodes[i];
					ttt_struct.shifts[ttt_struct.current_form_id] = ttt_struct.zero_shift;
					if (e.childNodes[i].innerHTML == '') { // wrong formatted form in HTML - np, let's assume this form goes till new form or end of page
						ttt_struct.form_type = 2;
					} else { // ignore forms in future ttt
						ttt_struct.form_type = 1;
						ttt(e.childNodes[i], win);
						ttt_struct.form_type = 0;
						ttt_struct.current_form_id = 0;
					}
				} else {
					ttt(e.childNodes[i], win);
				}
			}
		}
	}

	ttt(document.body, window);
	
//	alert("ttt_struct: " + ttt_struct);
	
	return ttt_struct;
}
