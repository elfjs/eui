/*
 * eui JavaScript Library
 * 
 * create:
 * @2011-08-25 by mytharcher
 * 
 * update:
 */

///import js.util.Type;
///import eui.util.OptionsParser;

/**
 * 字符串转换为布尔类型
 * @method eui.OptionsParser.toBoolean
 * @static
 * 
 * @param {String} arg
 * 
 * @return {Boolean}
 */
eui.util.OptionsParser.toBoolean = function (arg) {
	var intValue = parseInt(arg, 10);
	return js.util.Type.isString(arg) ?
		(isNaN(intValue) ?
			(arg == 'false' ? false : true)
			: !!intValue)
		: arg;
};
