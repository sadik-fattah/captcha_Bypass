function rumola_document(default_search_enabled) {

	this.init = function(search_enabled) {
		this.my_forms = new Array();
		this.wait_events = new Array();
		this.max_form_id = 0;
		this.zero_form_tag = 0;
		this.load_fires = true;
		this.selected_i_field = null;
		this.selected_t_field = null;
		this.my_forms_array_type = search_enabled ? 0 : -1;
	}
	this.init(default_search_enabled);

	// add this event listeners recurently for all the frames
	try	{
		initDocumentEventListener(window, "load", rumola.document_load_fires, true); // to catch loading images or frames
		initDocumentEventListener(window, "contextmenu", rumola_handleContextMenu, true);

		initDocumentEventListener(window, "keypress", rumola.document_changed, false); // to start/stop solve, cancel Rumola
		initDocumentEventListener(window, "change", rumola.document_changed, false); // to start/stop solve, cancel Rumola
		initDocumentEventListener(window, "submit", rumola.vfs_submit, true); // catching captcha forms submition
		initDocumentEventListener(window, "click", rumola.vfs_click, true); // catching captcha forms submition

		initDocumentEventListener(window, "dragstart", dragevent, true);
		initDocumentEventListener(window, "dragenter", dropevent, true);
	} catch (exc) {
		rumola_notifications.send_exception(1309, exc);
	}

	this.apply_idle_mode = function() { // idle is -1
		this._suicide_forms();
		this.init(false);
		rumola_prefs.new_frame_id();
	}

	this.start_solve = function(form_id) {
		if (form_id != 0) {
			var x = this.my_forms[0];
			this.my_forms[0] = this.my_forms[form_id];
			this.my_forms[form_id] = x;
		}
		this.leave_only_zero_form();

		this.my_forms[0].start_solve();
	}

	this.apply_simple_mode_and_leave_form = function(form_id) { // simple mode == 1
		//
	}

	this.leave_only_zero_form = function() {
		this._suicide_forms_except_one(0);
		this.my_forms_array_type = 1;
	}

	this.apply_simple_mode = function(selected_i_field, selected_t_field) { // simple mode == 1
		this.apply_idle_mode();
		this.my_forms_array_type = 1;
		this.selected_t_field = selected_t_field;
		this.selected_i_field = selected_i_field;

		if (this.selected_t_field && this.selected_i_field) {
			var objects = new Array();
			objects[0] = this.selected_i_field;
			objects[1] = this.selected_t_field;
			var line = "||C:b05911b84d9||F:b05911b84d9";
			this.my_forms[0] = new rumola_form_wait(null, objects, line, 0);
			var toGate = "-1||0" + line;
		} else {
			var ttt_struct = full_process_page(1, 9999999);
			this.my_forms[0] = new rumola_form_wait(null, ttt_struct.objects[0], ttt_struct.lines[0], 0);
			var toGate = "-1||0" + ttt_struct.lines[0];
		}

		if (this.selected_t_field && !toGate.match(/\|\|[F]:/))
			return;
		if (this.selected_i_field && !toGate.match(/\|\|[C]:/))
			return;

		if (toGate.match(/\|\|[TF]:/) && toGate.match(/\|\|[ICOWRD]:/)) {
			chrome.extension.sendRequest({action: "RequestToFirstGate", frame_id: rumola.frame_id, toGate: toGate});
		}
	}

	// private
	this._suicide_forms_except_one = function(j) {
		for (var i=0; i<this.my_forms.length; i++) {
			if ((this.my_forms[i])&&(i!=j)) {
				this.my_forms[i].suicide();
				this.my_forms[i] = null;
			}
		}
	}

	this._suicide_forms = function() {
		this._suicide_forms_except_one(-1);
	}
}

function rumola_form_wait(my_form, objects, line, shift) { // for zero form shift is unique id
	this.my_form = my_form;
	this.important_elements = objects;
	this.form_hash = hashCode(line);
	this.shift = shift;

	this.suicide = function() {
		this.my_form = null;
		for (var i=0; i<this.important_elements.length; i++) {
			this.important_elements[i] = null;
		}
	}
}

function rumola_form_ready(my_form, t_field, i_field, captcha_id, b_gate_url) {
	this.my_form = my_form;
	this.captcha_id = captcha_id;
	this.b_gate_url = b_gate_url;
	this.solving_type = 0;

	this._ondblclick = function(evt) {
		// "this" is a input field
		for (var i=0; i<rumola.document.my_forms.length; i++)
			if ((rumola.document.my_forms[i] instanceof rumola_form_ready)&&(rumola.document.my_forms[i].is_captcha_input(evt.target))) {
				rumola.document.start_solve(i);
				return;
			}
	}
	this.start_solve = function() {
		if (this.solving_type != 0)
			return;

		this.solving_type = 1;
		this.i_field.set_solving_icon();
		this.t_field.set_solving_icon();
		this._send_image_to_gate();
	}

	this.t_field = new rumola_form_ready_input(t_field, this._ondblclick);
	this.i_field = new rumola_form_ready_image(i_field);

	this.i_field_reloaded = function() {
		this.i_field = new rumola_form_ready_image(this.i_field.suicide());
	}

	this.is_captcha_image = function(target, bIncludeBothImages) {
		if (this.i_field._i_field == target)
			return true;
		if (!this.i_field._i_field)
			return false;
		if (this.i_field._i_field.contains(target))
			return true;
		if (!bIncludeBothImages)
			return false;
		if (this.i_field._my_i_field == target)
			return true;
		return false;
	}

	this.is_captcha_input = function(target) {
		if (this.t_field._t_field == target)
			return true;
		return false;
	}

	this.is_my_form = function(f) {
		if (this.t_field._t_field.form == f)
			return true;
		return false;
	}

	this.change_t_field = function(t_field) {
		this.t_field.change_input_field(t_field);
	}

	this.get_t_position = function() {
		return this.t_field._t_field.getBoundingClientRect();
	}

	this.set_t_value = function(s) {
		this.t_field.set_value(s);
		this.solving_type++;
	}

	this.operation_id = 1;

	this.suicide = function() {
		this.t_field.suicide();
		this.t_field = null;
		this.i_field.suicide();
		this.i_field = null;
		this.captcha_id = null;
	}

	this._send_image_to_gate = function() {
		if (!this.captcha_id)
			return;

		var img = this.i_field.get_image_content();
		if (!img) {
			var _this = this;
			setTimeout(function (_this) {_this._send_image_to_gate();}, 250, _this);
			return;
		}

//		call_captcha_solutions2();

//		var image = new Image();
//		image.id = 'rumola';
//		image.src = img;
//		document.getElementById('content').appendChild(image);

		img = img.replace(/^data:image\/png;base64,/, "");
		chrome.extension.sendRequest({action: "StartResolve", frame_id: rumola.frame_id, method:"POST", url:this.b_gate_url+this.captcha_id+"&f=0", data:img});
		rumola_notifications.playSound("notifications/start.wav");
	}
}

var rumola = {
		frame_id: null,
		document: null,
		last_changed_element: null,
		bulk_counter: 0,

		document_load_fires: function (aEvent) {
			try
			{
				if (((aEvent.target instanceof aEvent.target.ownerDocument.defaultView.HTMLIFrameElement)||(aEvent.target instanceof aEvent.target.ownerDocument.defaultView.HTMLFrameElement))&&(isAccessibleChildFrame(aEvent.target))) {// TODO: check win. is ok?
					initDocumentEventListener(aEvent.target.contentWindow, "load", rumola.document_load_fires, true);
					initDocumentEventListener(aEvent.target.contentWindow, "contextmenu", rumola_handleContextMenu, true);

					initDocumentEventListener(aEvent.target.contentWindow, "keypress", rumola.document_changed, false);
					initDocumentEventListener(aEvent.target.contentWindow, "change", rumola.document_changed, false);
					initDocumentEventListener(aEvent.target.contentWindow, "submit", rumola.vfs_submit, true);
					initDocumentEventListener(aEvent.target.contentWindow, "click", rumola.vfs_click, true);

					initDocumentEventListener(aEvent.target.contentWindow, "dragstart", dragevent, true);
					initDocumentEventListener(aEvent.target.contentWindow, "dragenter", dropevent, true);
					rumola.document.load_fires = true; // can appear anything
					return;
				}

				if (!aEvent.target.ownerDocument.defaultView instanceof HTMLImageElement)
					return;

				for (var i=0; i<rumola.document.my_forms.length; i++) {
					if ((rumola.document.my_forms[i] instanceof rumola_form_ready)&&(rumola.document.my_forms[i].solving_type == 0)&&(rumola.document.my_forms[i].is_captcha_image(aEvent.target, false))) {
						rumola.document.my_forms[i].i_field_reloaded();
						return;
					}
				}

				rumola.document.load_fires = true;
			}
			catch (exc) {rumola_notifications.send_exception(1531, exc);}
		},

		// *****************************************************************************************

		document_changed: function (aEvent) {
			try
			{
				if (aEvent.target == rumola.last_changed_element)
					return;
				rumola.last_changed_element = aEvent.target;

				if ((aEvent.keyCode == 9)||(aEvent.keyCode == 13))
					return;

				if (rumola.document.my_forms_array_type == -1)
					return;

				for (var i=0; i<rumola.document.my_forms.length; i++) {
					if (rumola.document.my_forms[i] instanceof rumola_form_ready) {
						if ((rumola.document.my_forms[i].solving_type < 3)&&(rumola.document.my_forms[i].is_captcha_input(aEvent.target))) {
							rumola_notifications.playSound("notifications/cancelled.wav");
							rumola.document.apply_idle_mode();
							return;
						}
						if ((rumola.document.my_forms[i].solving_type == 0)&&(rumola.document.my_forms[i].is_my_form(aEvent.target.form))) {
							rumola.document.start_solve(i);
							return;
						}
					}
				}
			}
			catch (exc) {rumola_notifications.send_exception(1205, exc);}
		},

		vfs_submit: function(aEvent) {
			try
			{
				if (rumola.document.wait_events === null)
					return;

				if (rumola.document.my_forms_array_type == -1)
					return;

				var f = aEvent.target;
				var k = null;
				for (var i=0; i<rumola.document.my_forms.length; i++) {
					if ((rumola.document.my_forms[i] instanceof rumola_form_ready)&&(rumola.document.my_forms[i].is_my_form(f))) {
						k = i;
						break;
					}
				}
				if (k == null)
					return;

				if (rumola.document.my_forms[0].solving_type > 1)
					return;

				if (rumola.document.my_forms[k].solving_type == 0)
					rumola.document.start_solve(k);

				wait_box.create_wait_div();
				aEvent.preventDefault();
				aEvent.stopPropagation();

				rumola.document.wait_events.push({form:f});
			}
			catch (exc) {rumola_notifications.send_exception(1609, exc);}
		},

		vfs_click: function(aEvent) {
			try
			{
				if (rumola.document.wait_events === null)
					return;

				if (rumola.document.my_forms_array_type == -1)
					return;

				if (aEvent.button != 0)
					return;

				if (aEvent.target.id == 'A5D44724019B' || aEvent.target.id == 'E6D44724019B' || aEvent.target.id == 'F8D54724019B' || aEvent.target.id == 'AF976188709B')
					return;

				var bGood = ((aEvent.target.tagName == 'INPUT')&&
						((aEvent.target.type == 'button')||(aEvent.target.type == 'image')||(aEvent.target.type == 'submit')));
				bGood = bGood || (aEvent.target.tagName == 'BUTTON');
				if (!bGood) {
					bGood = aEvent.target.ownerDocument.defaultView.getComputedStyle(aEvent.target, null).getPropertyValue("cursor") == 'pointer';
				}
				if (!bGood)
					return;

				if (rumola.document.my_forms_array_type == 0) {
					var pos = aEvent.target.getBoundingClientRect();
					var ww = Math.max(windowWidth()*0.33, 250);
					for (var i=0; i<rumola.document.my_forms.length; i++) {
						if (rumola.document.my_forms[i] instanceof rumola_form_ready) {
							var pos1 = rumola.document.my_forms[i].get_t_position();
							if ((Math.abs(pos1.bottom-pos.top) < 150)&&(Math.abs(pos1.left-pos.left) < ww)) {
								rumola.document.start_solve(i);
								break;
							}
						}
					}
				}

				if ((rumola.document.my_forms_array_type == 1)&&(rumola.document.my_forms[0] instanceof rumola_form_ready)&&(rumola.document.my_forms[0].solving_type == 1)) {
					wait_box.create_wait_div();
					aEvent.preventDefault();
					aEvent.stopPropagation();

					var evt = document.createEvent("MouseEvent");
					evt.initMouseEvent(aEvent.type, aEvent.bubbles, aEvent.cancelable, aEvent.view, aEvent.detail, 
							aEvent.screenX, aEvent.screenY, aEvent.clientX, aEvent.clientY, 
							aEvent.ctrlKey, aEvent.altKey, aEvent.shiftKey, aEvent.metaKey, aEvent.button, aEvent.relatedTarget);
					rumola.document.wait_events.push({evt:evt,target:aEvent.target});
				}
			}
			catch (exc) {rumola_notifications.send_exception(1603, exc);}
		},

		// *****************************************************************************************

		process_document: function () {
			try {
				if (rumola.document.my_forms_array_type == 0) {
					var toGate = "";
					if (rumola.document.load_fires) { // TODO: think about it - only if load_fires it can be any changes?
						for (var k = 1; k <= rumola.document.max_form_id; k++) {
							// TODO: make function is_image_gone_from_page and call it. parentNode is a bad solution
							// https://developer.mozilla.org/en-US/docs/Web/API/Node.contains
							if ((rumola.document.my_forms[k] instanceof rumola_form_ready)&&(!rumola.document.my_forms[k].i_field._i_field.parentNode)) {
								rumola.document.my_forms[k].suicide();
								rumola.document.my_forms[k] = null;
							}
						}

						// TODO: stop if total number of forms will be big
						var ttt_struct = full_process_page(0, 20000);

						// TODO: may be i need to save local_max_form_id before full_process_page and use it not in all parts of code?
						var local_max_form_id = rumola.document.max_form_id;
						var have_changes = false;
						for (var k = 1; k <= local_max_form_id; k++) {
							if (!rumola.document.my_forms[k] && !ttt_struct.forms[k])
								continue;
							if (!rumola.document.my_forms[k] || !ttt_struct.forms[k]) {
								have_changes = true;
								break;
							}
							if (rumola.document.my_forms[k] instanceof rumola_form_ready)
								continue;
							if (rumola.document.my_forms[k].form_hash != hashCode(ttt_struct.lines[k])) {
								have_changes = true;
								break;
							}
						}

						var have_ready_forms = false;
						for (var k = 1; k <= local_max_form_id; k++) {
							if (rumola.document.my_forms[k] instanceof rumola_form_ready) {
								have_ready_forms = true;
								break;
							}
						}

						if (!have_ready_forms && !have_changes) {
							if (!rumola.document.my_forms[0] || (rumola.document.my_forms[0].form_hash != hashCode(ttt_struct.lines[0])))
								have_changes = true;
						}

						if (have_changes) {
							// TODO: if have_ready_forms then each form must have ICOWRD and TF
							if (!have_ready_forms) {
								if (rumola.document.my_forms[0])
									rumola.document.my_forms[0].suicide();
								rumola.document.my_forms[0] = new rumola_form_wait(null, ttt_struct.objects[0], ttt_struct.lines[0], 0);
								toGate = toGate + get_zero_from_tag() + "||0" + ttt_struct.lines[0] + "\n";
							}
							for (var k = 1; k <= local_max_form_id; k++) {
								if (!rumola.document.my_forms[k] && !ttt_struct.forms[k])
									continue;
								if (rumola.document.my_forms[k] && !ttt_struct.forms[k]) {
									rumola.document.my_forms[k].suicide();
									rumola.document.my_forms[k] = null;
									continue;
								}
								if (!rumola.document.my_forms[k] && ttt_struct.forms[k]) {
									rumola.document.my_forms[k] = new rumola_form_wait(ttt_struct.forms[k], ttt_struct.objects[k], ttt_struct.lines[k], ttt_struct.shifts[k]);
									toGate = toGate + ttt_struct.shifts[k] + "||" + k + ttt_struct.lines[k] + "\n";
									continue;
								}
								if (rumola.document.my_forms[k] instanceof rumola_form_ready)
									continue;
								if (!have_ready_forms || (rumola.document.my_forms[k].form_hash != hashCode(ttt_struct.lines[k]))) {
									rumola.document.my_forms[k].suicide();
									rumola.document.my_forms[k] = null;

									var f = newFormId(ttt_struct.forms[k]);
									rumola.document.my_forms[f] = new rumola_form_wait(ttt_struct.forms[k], ttt_struct.objects[k], ttt_struct.lines[k], ttt_struct.shifts[k]);
									toGate = toGate + ttt_struct.shifts[k] + "||" + f + ttt_struct.lines[k] + "\n";

									continue;
								}
							}

							// TODO: if have_ready_forms i need to make this checks for every form
							if (!toGate.match(/\|\|[TF]:/) || !toGate.match(/\|\|[ICOWRD]:/) || (!ttt_struct.have_good_fields)) {
								toGate = "";
							}
						}
					}
					rumola.document.load_fires = false;

					if (toGate) {
						chrome.extension.sendRequest({action: "RequestToFirstGate", frame_id: rumola.frame_id, toGate: toGate});
					}
				}
			} catch (exc) {
				rumola_notifications.send_exception(1208, exc);
			}
			if (rumola.document.my_forms_array_type == 0)
				setTimeout(rumola.process_document, 450);
		},

		document_load: function(pd) {
			if (!document instanceof HTMLDocument)
				return;

			if ((""+document.domain).match(/(contentsolutions\.com|captchas\.xyz)$/)) {
				var e = document.getElementById("9C6079EE-41B2-11E1-989C-B9874824019B");
				if (e) e.setAttribute("style", "display:none");

				var e = document.getElementById("A62533E4-285A-11E3-A009-36756188709B");
				if (e) e.style.removeProperty("display");

				var e = document.getElementById("AB3BD3FA-285B-11E3-ADDA-16766188709B");
				if (e) chrome.extension.sendRequest({action: "EnterClientArea"});

				var e = document.getElementById("02C7023C-7AF7-11E3-B1E5-8FD06188709B");
				if (rumola_prefs.client_area_link && e) {
					e.style.removeProperty("display");
					document.getElementById("5E52DC70-7AF7-11E3-82DE-1DD16188709B").setAttribute('href', rumola_prefs.client_area_link);
				}
			}
			rumola.document = new rumola_document(pd);
			if (pd)
				rumola.process_document();
		},

		// *****************************************************************************************

		i_selected: function(i_field) {
			for (var i=0; i<rumola.document.my_forms.length; i++) {
				if ((rumola.document.my_forms[i] instanceof rumola_form_ready)&&(rumola.document.my_forms[i].is_captcha_image(i_field, true))) {
					if (rumola.document.my_forms[i].solving_type == 0)
						rumola.document.start_solve(i);
					return;
				}
			}
			rumola.document.apply_simple_mode(i_field, rumola.document.selected_t_field);
			rumola_notifications.notify_manual_selecting(i_field, true);
		},

		t_selected: function(t_field) {
			for (var i=0; i<rumola.document.my_forms.length; i++) {
				if ((rumola.document.my_forms[i] instanceof rumola_form_ready)&&(rumola.document.my_forms[i].is_captcha_input(t_field))) {
					if (rumola.document.my_forms[i].solving_type == 0)
						rumola.document.start_solve(i);
					return;
				}
			}

			if ((rumola.document.my_forms_array_type == 1)&&(rumola.document.my_forms[0] instanceof rumola_form_ready)&&(rumola.document.my_forms[0].solving_type > 0)) {
				rumola.document.selected_t_field = t_field;
				rumola.document.my_forms[0].change_t_field(t_field);
				return;
			}

			rumola.document.apply_simple_mode(rumola.document.selected_i_field, t_field);
			rumola_notifications.notify_manual_selecting(t_field, false);
		},

		process_document_by_request: function(selected_i_field, selected_t_filed) {
			rumola.document.apply_simple_mode(null, null);
		},

		// *****************************************************************************************

		response_from_first_gate: function(tags, b_gate_url) {

			rumola.last_changed_element = null;
			if (!tags[0].match(/{{/)) {
				rumola_notifications.playSound("notifications/found.wav");
			}

			for (var i=5; i<tags.length; i+=5) {
				if (!(rumola.document.my_forms[tags[i-3]] instanceof rumola_form_wait)) {//tag[2]
					continue;
				}
				if (tags[i-3] == 0) {//tag[2]
					if ((rumola.document.my_forms_array_type == 0)&&(rumola.document.zero_form_tag != tags[i-4])) {//tag[1]
						return;
					}
					rumola.document.leave_only_zero_form();
				}

				rumola_prefs.last_found_captcha_id = tags[i-3];//tag[2]
				var tmp = new rumola_form_ready(rumola.document.my_forms[tags[i-3]].my_form, rumola.document.my_forms[tags[i-3]].important_elements[tags[i-2]], rumola.document.my_forms[tags[i-3]].important_elements[tags[i-1]], tags[i], b_gate_url);
				rumola.document.my_forms[tags[i-3]].suicide();
				rumola.document.my_forms[tags[i-3]] = tmp;
//				if (rumola.document.selected_i_field) {
				rumola.document.start_solve(tags[i-3]);
//				}
			}
		},

		response_from_second_gate: function(tags, _resp) {
			try	{
				if (tags.length < 5)
					return;
				if (!rumola.document.my_forms[0] instanceof rumola_form_ready)
					return;

				_resp(); // to notify

				switch (tags[3]) {
				case "ERR":
					wait_box.hide_wait_div();
					rumola.document.apply_idle_mode();
					rumola_prefs.change_rumola_gate_url();
					break;
				case "WAIT":
				case "TMP":
					var fid = rumola.frame_id;
					setTimeout(function() {
						if (rumola.frame_id != fid) {
							return;
						}

						chrome.extension.sendRequest({action: "StartResolve", frame_id: rumola.frame_id, method:"GET", data:null, url:rumola.document.my_forms[0].b_gate_url+rumola.document.my_forms[0].captcha_id});
					}, tags[4]);
					if (tags[3] == 'WAIT')
						break;
				case "OK":
					rumola.document.my_forms[0].set_t_value(tags[5]);
					if ((rumola.document.wait_events !== null)&&(rumola.document.wait_events.length > 0)&&((tags[3] == 'OK')||(rumola_prefs.switcher_position == 'q'))) {
						wait_box.hide_wait_div();
//						setTimeout(function() {
						for (var i=0; i<rumola.document.wait_events.length; i++) {
							if (rumola.document.wait_events[i].form) {
								// rumola.document.wait_events[i].form.submit();
								HTMLFormElement.prototype.submit.call(rumola.document.wait_events[i].form);
							} else {
								rumola.document.wait_events[i].target.dispatchEvent(rumola.document.wait_events[i].evt);
							}
						}
						rumola.document.wait_events = null;
//						}, 1);
					}
					if (tags[3] == 'TMP')
						break;
					if (!tags[0].match(/{{/)) {
						rumola_notifications.playSound("notifications/entered.wav");
					}
					rumola.document.my_forms[0].i_field.suicide();
				}
			}
			catch (exc) {rumola_notifications.send_exception(1006, exc);}
		}
}

var rumola_prefs = {
		enabled: true,
		last_found_captcha_id: null,
		b_active_tab: false,
		switcher_position: 'p',
		last_context_element: null,
		last_dragged_element: null,
		wait_box_unique_message_id: null,
		client_area_link: null,
		filters: Array(),

		new_frame_id: function() {
			rumola.frame_id = "::"+(new Date()).getTime()+"::"+Math.random();
		},

		init_prefs: function() {
			if (top == window)
				window.addEventListener("message", wait_box._got_message, true);

			// TODO: think, may be i can get information faster (without callback). very small priority.
			chrome.extension.sendRequest({action: "PleaseSendPrefs"},
					function(response) {
				rumola_prefs.new_frame_id();
				chrome.extension.onRequest.addListener(rumola_prefs.on_request);
				rumola_prefs.switcher_position = response.switcher_position;
				rumola_prefs.enabled = response.enabled; // true or false
				rumola_prefs.b_active_tab = response.b_active_tab;
				rumola_prefs.wait_box_unique_message_id = response.wait_box_unique_message_id;
				rumola_prefs.client_area_link = response.client_area_link;
				var filter_strings = response.filter_string.split("||");
				for (var i=0; i<filter_strings.length; i++)
					rumola_prefs.filters.push(new RegExp(filter_strings[i], "i"));
				rumola.document_load(rumola_prefs.enabled);

			}
			);
		},

		on_request: function(req, sender, sendResponse) {
			try {
				if (req.frame_id && req.frame_id != rumola.frame_id) {
					return;
				}
				switch (req.action) {
				case "TSelected":
					rumola.t_selected(rumola_prefs.last_context_element);
					break;
				case "ISelected":
					rumola.i_selected(rumola_prefs.last_context_element);
					break;
				case "AutoSearch":
					rumola.process_document_by_request(null, null);
					break;
				case "Cancel":
					rumola.document.apply_idle_mode();
					break;
				case "ResponseFromFirstGate":
					rumola.response_from_first_gate(req.tags, req.b_gate_url);
					break;
				case "JustDeactivated":
					rumola_prefs.b_active_tab = false;
					break;
				case "JustActivated":
					rumola_prefs.b_active_tab = true;
					break;
				case "StartLastCaptchaRecognition":
					if ((rumola.document.my_forms[rumola_prefs.last_found_captcha_id] instanceof rumola_form_ready)&&(rumola.document.my_forms[rumola_prefs.last_found_captcha_id].solving_type == 0)) {
						rumola.document.start_solve(rumola_prefs.last_found_captcha_id);
					}
					break;
				case "ResponseFromSecondGate":
					rumola.response_from_second_gate(req.tags, sendResponse);
					break;
				}

			}
			catch (exc) {rumola_notifications.send_exception(1121, exc);}
		},

		change_switcher_pos: function(prev) {
			var v = (prev == "q") ? "p" : "q";
			chrome.extension.sendRequest({action: "SetSwitcherValue", value:v});
			return v;
		},

		change_rumola_gate_url: function() {
			chrome.extension.sendRequest({action: "ChangeRumolaGateUrl"});
		}
};


var rumola_notifications = { // send_exception, playSound, notify_manual_selecting 
		last_exception_sent: 0,
		notifying_counter: 0,

		send_exception: function(from, exception) {
			var n = (new Date()).getTime();
			if (rumola_notifications.last_exception_sent + 150000 > n)
				return;
			rumola_notifications.last_exception_sent = n;
			// THIS IS ONLY FOR BETA VERSION!

			var vDebug = "from: "+from+"\n";
			vDebug += "stack:"+exception.stack+"\n===============end==========\n\n";
			try {
				var objHTTP = new XMLHttpRequest();
				objHTTP.open('POST', "http://gate1a.skipinput.com/exception_gate_new2.php", true);
				objHTTP.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				objHTTP.send(vDebug);
			} catch (exc) {}
		},

		playSound: function(fileName) {
			chrome.extension.sendRequest({action: "PlaySound", file:fileName});
		},

		notify_manual_selecting: function (e, ic) {
			var pp = e.style.getPropertyPriority("visibility");
			var pv = e.style.removeProperty("visibility");
			e.style.setProperty("visibility", "hidden", "important");
			if (ic)
				rumola_notifications.notifying_counter++;
			setTimeout(function () {e.style.removeProperty("visibility");e.style.setProperty("visibility", pv, pp);if (ic) rumola_notifications.notifying_counter--;}, 650);
		}
};

if ((parent == window)||(!isAccessibleParentFrame(parent))) {
	try {
		rumola_prefs.init_prefs();
	} catch (exc) {
		rumola_notifications.send_exception(1210, exc);
	}
}
