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
///import eui.Component;
///import eui.IMouseEventHanders;
///import eui.button;

/**
 * @class eui.button.Button
 * @extends eui.Component

基本按钮控件。

 */
eui.button.Button = js.util.Class.create({
	type: 'button',
	mainTag: 'button',
	content: 'Button',
	
	constructor: function (options) {
		eui.Component.call(this, options);
	}
}, eui.Component, [
	eui.IMouseEventHanders,
	eui.form.INativeComponent
]);
