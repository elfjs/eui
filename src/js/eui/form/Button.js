/*
 * eui JavaScript Library
 * 
 * create: 
 * @2011-08-24 by mytharcher
 * 
 * update:
 */

///import js.util.Class;
///import js.dom.Event;
///import eui.Base;

eui.form.Button = js.util.Class.create({
	constructor: function (options) {
		eui.Base.call(this, options);
	}
	// getConfig: function () {
		// var config = eui.Base.prototype.getConfig.call(this);
		// config.rendered = true;
		// return config;
	// }
}, eui.Base);