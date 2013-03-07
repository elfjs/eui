///import eui;

eui.IMouseEventHandler = {
	defaultEvents: 'click,mouseOver,mouseout,mousedown,mouseup',
	
	_handleclick: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_CLICK) === false) {
			ev.preventDefault();
			return false;
		}
	},
	
	_handlemouseover: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_MOUSE_OVER) === false) {
			ev.preventDefault();
			return false;
		}
		js.dom.ClassName.add(this.getMain(), this.getClassName(this.classHover));
	},
	
	_handlemouseout: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_MOUSE_OUT) === false) {
			ev.preventDefault();
			return false;
		}
		js.dom.ClassName.remove(this.getMain(), this.getClassName(this.classHover));
	},
	
	_handlemousedown: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_MOUSE_DOWN) === false) {
			ev.preventDefault();
			return false;
		}
		js.dom.ClassName.add(this.getMain(), this.getClassName(this.classPress));
	},
	
	_handlemouseup: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_MOUSE_UP) === false) {
			ev.preventDefault();
			return false;
		}
		js.dom.ClassName.remove(this.getMain(), this.getClassName(this.classPress));
	}
};
