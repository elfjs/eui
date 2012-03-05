/*
 * eui JavaScript Library
 * 
 * create: 
 * @2012-03-04 by mytharcher
 * 
 * update:
 */

///import js.util.Shortcut;
///import js.util.Type;
///import js.util.Type.~Element;
///import eui;
///import eui.Engine;

/**
 * @ignore
 * 给eui快捷处理添加对象处理方式：基于元素创建一个组件
 */
js.util.Shortcut.intercept(eui, js.util.Type.ELEMENT, eui.Engine.make);
