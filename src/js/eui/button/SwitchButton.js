/*
 * eui JavaScript Library
 * 
 * create: 
 * @2012-06-09 by mytharcher
 * 
 * update:
 */

///import js.util.Class;
///import eui.button.StatusButton;

/**
 * @class SwitchButton
 */
eui.button.SwitchButton = js.util.Class.create({
	constructor: function (options) {
		eui.button.StatusButton.call(this, options);
	}
	
}, eui.button.StatusButton);
