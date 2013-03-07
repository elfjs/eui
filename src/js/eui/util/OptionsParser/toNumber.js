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
 * 字符串转换为数字类型
 * @method eui.OptionsParser.toNumber
 * @static
 * 
 * @param {String} arg
 * 
 * @return {Boolean}
 */
eui.util.OptionsParser.toNumber = function (arg) {
	return js.util.Type.isNumber(arg) ? arg : parseFloat(arg);
};