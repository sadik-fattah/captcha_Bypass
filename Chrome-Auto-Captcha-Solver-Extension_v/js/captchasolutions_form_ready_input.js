function rumola_form_ready_input(t_field, dblclick_listener) {
	// private
	this._t_field = t_field;

	// public
	this.change_input_field = function(t_field) {
		if (this._dblclick_listener)
			this._t_field.removeEventListener("dblclick", this._dblclick_listener, true);
		var x = this._icon_url;
		this._visual_cancel();
		if ((this._t_field_previous_value !== null)&&(this._t_field.value == this._solution)) {
			this._t_field.value = this._t_field_previous_value;
		}
		this._t_field_previous_value = null;

		this._t_field = t_field;

		this._icon_url = x;
		if (this._icon_url)
			this._update_icon();
		if (this._dblclick_listener)
			this._t_field.addEventListener("dblclick", this._dblclick_listener, true);
		if (this._solution) {
			this.set_value(this._solution);
		}
	}

	this.set_solving_icon = function() {
		if (this._icon_url) {
			this._icon_url = "url("+getURL("images/pen_r.gif")+")";
			this._update_icon();
		}
		if (this._dblclick_listener) {
			this._t_field.removeEventListener("dblclick", this._dblclick_listener, true);
			this._dblclick_listener = null;
		}
	}

	this._solution = null;
	this._t_field_previous_value = null;
	this.set_value = function(v) {
		if (this._t_field_previous_value == null)
			this._t_field_previous_value = this._t_field.value;
		this._t_field.value = v;
		this._solution = v;
		this._visual_cancel();
	}

	this.suicide = function() {
		this._visual_cancel();
		if (this._dblclick_listener) {
			this._t_field.removeEventListener("dblclick", this._dblclick_listener, true);
			this._dblclick_listener = null;
		}
		this._t_field = null;
	}

	// private
	this._dblclick_listener = dblclick_listener;
	this._t_field.addEventListener("dblclick", dblclick_listener, true);

	this._icon_url = "url("+getURL("images/pen_w.gif")+")";
	this._t_field_style = null;
	this._update_icon = function() {
		if (!this._t_field_style) {
			this._t_field_style = {bi_important:this._t_field.style.getPropertyPriority("background-image"), bi_value:this._t_field.style.removeProperty("background-image"),
					br_important:this._t_field.style.getPropertyPriority("background-repeat"), br_value:this._t_field.style.removeProperty("background-repeat"),
					bp_important:this._t_field.style.getPropertyPriority("background-position"), bp_value:this._t_field.style.removeProperty("background-position")};
		}
		this._t_field.style.setProperty("background-image", this._icon_url, "important");
		this._t_field.style.setProperty("background-repeat", "no-repeat", "important");
		this._t_field.style.setProperty("background-position", "0px 0px", "important");
	}
	this._update_icon();

	this._visual_cancel = function() {
		if (this._t_field_style) {
			this._t_field.style.removeProperty("background-image");
			this._t_field.style.removeProperty("background-repeat");
			this._t_field.style.removeProperty("background-position");
			this._t_field.style.setProperty("background-image", this._t_field_style.bi_value, this._t_field_style.bi_important);
			this._t_field.style.setProperty("background-repeat", this._t_field_style.br_value, this._t_field_style.br_important);
			this._t_field.style.setProperty("background-position", this._t_field_style.bp_value, this._t_field_style.bp_important);
			this._t_field_style = null;
			this._icon_url = null;
		}
	}
}