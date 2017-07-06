// TODO: remove console.log

function rumola_form_ready_image(i_field) {
	// private
	this._i_field = i_field;
	this._asap = false;
	this._image_content = null;
	this._my_i_field = null;

	// public
	this.get_image_content = function() {
		this._asap = true;
		return this._image_content;
	}

	this.set_solving_icon = function() {
		if (!this._i_field) // class already died
			return; 
		if (!this._my_i_field) { // still not ready
			setTimeout(function (_this) {_this.set_solving_icon();}, 45, this);
			return;
		}
		this._my_i_field.style.setProperty("background-image", "url("+getURL("images/eye_r32x16.gif")+")", "important");
	}

	this.suicide = function() {
		if (this._my_i_field) {
			if (this._my_i_field.parentNode)
				this._my_i_field.parentNode.removeChild(this._my_i_field);
			this._i_field.style.removeProperty("display");
			this._i_field.style.setProperty("display", this._i_field_display_style.value, this._i_field_display_style.important);
		}
		var x = this._i_field;
		this._i_field = null;
		this._my_i_field = null;
		return x;
	}

	// private
	this._image_grabbed = function(image_src, image_src_transparent, width, height) {
		this._image_content = image_src;

		this._my_i_field = document.createElement("img");
		this._my_i_field.style.cssText = window.getComputedStyle(this._i_field, null).cssText;
		// TODO: copy other fields like title e.t.c.
		this._my_i_field.style.setProperty("background-image", "url("+getURL("images/eye_w32x16.gif")+")", "important");
		this._my_i_field.style.setProperty("background-repeat", "no-repeat", "important");
		this._my_i_field.style.setProperty("background-position", "0px 0px", "important");
		this._my_i_field.src = image_src_transparent;
		this._i_field_display_style = {important:this._i_field.style.getPropertyPriority("display"), value:this._i_field.style.removeProperty("display")};
		this._i_field.style.setProperty("display", "none", "important");
		if (this._i_field.parentNode.lastchild == this._i_field)
			this._i_field.parentNode.append(this._my_i_field);
		else
			this._i_field.parentNode.insertBefore(this._my_i_field, this._i_field.nextSibling);
	}

	this._i_field_reloaded = function(aEvent) {
		var objHTTP = aEvent.target;
		if (objHTTP.readyState != 4)
			return;

		if (!objHTTP._this._i_field) // class already died
			return;

		var binary = ''
		for (var j = 0; j < objHTTP.responseText.length; j++) {
			binary += String.fromCharCode(objHTTP.responseText.charCodeAt(j) & 0xff);
		}
		// TODO: why png? :)
		var tmp = "data:image/png;base64," + window.btoa(binary);
		var img = document.createElement("img");
		img.onload = function() {
			var tmpc = document.createElement("canvas");
			tmpc.width = img.width;
			tmpc.height = img.height;
			var _ctx = tmpc.getContext("2d");
			_ctx.globalAlpha = 0.2;
			_ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
			var tmp_transparent = tmpc.toDataURL("image/png");
				objHTTP._this._image_grabbed(tmp, tmp_transparent, img.width, img.height);
		}
		img.src = tmp;
	}

	this._try_capture_webrequest = function() {
		if (this._i_field.tagName != 'IMG') {
			rumola.document.apply_idle_mode();
			return;
		}

		var objHTTP = new XMLHttpRequest();

		objHTTP.open('GET', this._i_field.src, true);
		objHTTP._this = this;
		objHTTP.addEventListener("readystatechange", this._i_field_reloaded, true);
		objHTTP.overrideMimeType('text/plain; charset=x-user-defined');
		objHTTP.send();
	}

	this._try_capture_snapshot = function() {
		if (!this._i_field) // class already died
			return;

		// TODO: fix it. We can recurent send messages to parent and get my window real position
		if (top != window) {
			this._try_capture_webrequest();
			return;
		}

		if (!rumola_prefs.b_active_tab && !this._asap) {
			setTimeout(function (_this) {_this._try_capture_snapshot();}, 45, this);
			return;
		}

		if (!rumola_prefs.b_active_tab && this._asap && (this._i_field.tagName == 'IMG')) {
			this._try_capture_webrequest();
			return;
		}

		if (!rumola_prefs.b_active_tab || (rumola_notifications.notifying_counter > 0)) {
			setTimeout(function (_this) {_this._try_capture_snapshot();}, 45, this);
			return;
		}

		// wait element to be visible
		var prev_style = null;
		var win_width = windowWidth();
		var win_height = windowHeight();
		var pos = this._i_field.getBoundingClientRect();
		if (this._i_field.ownerDocument != document) {
			// TODO: think what to do? Moving to window is a bad idea.
			this._try_capture_webrequest();
			return;
		} else {
			if (pos.bottom == 0) {
				if (!this._asap) {
					setTimeout(function (_this) {_this._try_capture_snapshot();}, 45, this);
					return;
				}
				this._try_capture_webrequest();
				return;
			}
			if ((pos.left < 0)||(pos.top < 0)||(pos.right >= win_width)||(pos.bottom >= win_height)) {
				if (!this._asap) {
					setTimeout(function (_this) {_this._try_capture_snapshot();}, 45, this);
					return;
				}
				prev_style = this._save_post_and_move_image();
				var pos = {left:0, top:0, width:pos.width, height:pos.height};
			} else if (this._asap) {
				prev_style = this._save_post_and_move_image();
				var pos = {left:0, top:0, width:pos.width, height:pos.height};
			}
		}

		var _this = this;
		chrome.extension.sendRequest({action: "CaptureNow"}, function(response) {
			chrome.extension.sendRequest({action: "CaptureNow"}, function(response) {
				if (prev_style) {
					_this._restore_image_pos(prev_style);
				} else {
					var pos1 = _this._i_field.getBoundingClientRect();
					if ((pos1.left != pos.left)||(pos1.top != pos.top)) {
						setTimeout(function (_this) {_this._try_capture_snapshot();}, 150, _this);
						return;
					}
				}
				if (!_this._i_field) // class already died
					return;

				if (!response.dataUrl) {
					_this._try_capture_webrequest();
					return;
				}

				var img = document.createElement("img");
				img.onerror = function() {
					_this._try_capture_webrequest();
				}
				img.onload = function() {
					try {
						if (!_this._i_field) // class already died
							return;

						var kx = img.width/window.innerWidth;
						var ky = img.height/window.innerHeight;

						var tmpc = document.createElement("canvas");
						tmpc.width = pos.width;
						tmpc.height = pos.height;
						var _ctx = tmpc.getContext("2d");
						_ctx.globalAlpha = 0.2;
						_ctx.drawImage(img, pos.left * kx, pos.top * ky, pos.width * kx, pos.height * ky, 0, 0, pos.width, pos.height);
						var tmp_transparent = tmpc.toDataURL("image/png");

						_ctx.globalAlpha = 1;
						_ctx.drawImage(img, pos.left * kx, pos.top * ky, pos.width * kx, pos.height * ky, 0, 0, pos.width, pos.height);
						var tmp = tmpc.toDataURL("image/png");

						_this._image_grabbed(tmp, tmp_transparent, pos.width, pos.height);
					}
					catch (exc) {
						_this._try_capture_webrequest();
						return;
					}
				}
				img.src = response.dataUrl;
			});
		});
	}

	this._save_post_and_move_image = function() {
		// TODO: if it have any transparency, i need to put some image to background
		var prev_style = {dimportant:this._i_field.style.getPropertyPriority("display"), dvalue:this._i_field.style.getPropertyValue("display"),
			pimportant:this._i_field.style.getPropertyPriority("position"), pvalue:this._i_field.style.getPropertyValue("position"),
			limportant:this._i_field.style.getPropertyPriority("left"), lvalue:this._i_field.style.getPropertyValue("left"),
			timportant:this._i_field.style.getPropertyPriority("top"), tvalue:this._i_field.style.getPropertyValue("top"),
			zimportant:this._i_field.style.getPropertyPriority("z-index"), zvalue:this._i_field.style.getPropertyValue("z-index")};
		this._i_field.style.setProperty("display", "block", "important");
		this._i_field.style.setProperty("position", "fixed", "important");
		this._i_field.style.setProperty("left", "0px", "important");
		this._i_field.style.setProperty("top", "0px", "important");
		this._i_field.style.setProperty("z-index", "9223372036854776000", "important");
		return prev_style;
	}

	this._restore_image_pos = function(prev_style) {
		this._i_field.style.removeProperty("display");
		this._i_field.style.removeProperty("position");
		this._i_field.style.removeProperty("left");
		this._i_field.style.removeProperty("top");
		this._i_field.style.setProperty("display", prev_style.dvalue, prev_style.dimportant);
		this._i_field.style.setProperty("position", prev_style.pvalue, prev_style.pimportant);
		this._i_field.style.setProperty("left", prev_style.lvalue, prev_style.limportant);
		this._i_field.style.setProperty("top", prev_style.tvalue, prev_style.timportant);
		this._i_field.style.setProperty("z-index", prev_style.zvalue, prev_style.zimportant);
	}

	this._try_capture_wait = function() {
		if (!this._i_field) // class already died
			return;

		if (document.readyState != 'complete') {
			setTimeout(function (_this) {_this._try_capture_wait();}, 45, this);
			return;
		}
		if (this._i_field.tagName == 'OBJECT')
			setTimeout(function (_this) {_this._try_capture_snapshot();}, 3000, this);
		else if (this._i_field.tagName == 'DIV')
			setTimeout(function (_this) {_this._try_capture_snapshot();}, 500, this);
		else
			this._try_capture_snapshot();
	}

	this._try_capture_direct = function() {
		if (!this._i_field) // class already died
			return;

		if (this._i_field.tagName == 'IMG') {
			if (!this._i_field.complete || (rumola_notifications.notifying_counter > 0)) {
				setTimeout(function (_this) {_this._try_capture_direct();}, 45, this);
				return;
			}

			try {
				var _canvas = document.createElement("canvas");
				_canvas.width = this._i_field.width;
				_canvas.height = this._i_field.height;
				var _ctx = _canvas.getContext("2d");

				_ctx.globalAlpha = 0.2;
				_ctx.drawImage(this._i_field, 0, 0, _canvas.width, _canvas.height);
				var tmp_transparent = _canvas.toDataURL("image/png");

				_ctx.globalAlpha = 1;
				_ctx.drawImage(this._i_field, 0, 0, _canvas.width, _canvas.height);
				var tmp = _canvas.toDataURL("image/png");

				this._image_grabbed(tmp, tmp_transparent, this._i_field.width, this._i_field.height);
				return;
			} catch (secexc) {
				// the best method was failed
			}
			this._try_capture_snapshot();
			return;
		}
		this._try_capture_wait();
	}
	this._try_capture_direct();
}
