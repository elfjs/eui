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

/**
 * @class eui.button.Button
 * @extends eui.Base

基本按钮控件。

 */
eui.button.Button = js.util.Class.create({
	constructor: function (options) {
		eui.Base.call(this, options);
	}
	// getConfig: function () {
		// var config = eui.Base.prototype.getConfig.call(this);
		// config.rendered = true;
		// return config;
	// }
}, eui.Base);