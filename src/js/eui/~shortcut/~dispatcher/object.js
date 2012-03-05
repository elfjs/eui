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
 * 给eui快捷处理添加对象处理方式：创建一个组件
 */
js.util.Shortcut.intercept(eui, js.util.Type.OBJECT, eui.Engine.create);