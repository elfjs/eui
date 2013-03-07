eui.form.INativeComponent = {
	setDisabled: function (disabled) {
		eui.Component.prototype.setDisabled.call(this, disabled);
		if (~',button,input,select,textarea,'.indexOf(',' + this.mainTag.toLowerCase() + ',')) {
			this.getMain().disabled = disabled;
		}
	}
};
