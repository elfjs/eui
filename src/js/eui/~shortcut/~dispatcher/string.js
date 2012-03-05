/*
 * eui JavaScript Library
 * 
 * create: 
 * @2011-06-29 by mytharcher
 * 
 * update:
 */

///import js.util.Shortcut;
///import js.util.Type;
///import eui;
///import eui.Engine;

/**
 * @ignore
 * 给eui快捷处理添加字符串处理方式：获取控制器对象
 */
js.util.Shortcut.intercept(eui, js.util.Type.STRING, eui.Engine.get);