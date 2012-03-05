/*
 * eui JavaScript Library
 * 
 * create: 
 * @2011-07-28 by mytharcher
 * 
 * update:
 */

///import js.util.Class;
///import js.util.Global;
///import js.util.Namespace;
///import js.dom.Style;
///import js.dom.Stage.ready;

eui.Engine = {
	/**
	 * @property eui.Engine.UI_ATTR_KEY
	 * @type {String}
	 */
	UI_ATTR_KEY: 'ui',
	
	/**
	 * @property eui.Engine.AUTO_INITIALIZE
	 * @type {String}
	 */
	AUTO_INITIALIZE: false,
	
	/**
	 * @ignore
	 */
	'': js.dom.Stage.ready(function () {
		var Engine = eui.Engine;
		if (Engine.AUTO_INITIALIZE) {
			Engine.setup(document.body);
		}
	}),
	
	/**
	 * @private
	 */
	_set: {},
	
	/**
	 * 获取一个ui对象
	 * @method eui.Engine.get
	 * @static
	 * 
	 * @param {String} id
	 * 
	 * @return {Object}
	 */
	get: function (id) {
		return id instanceof eui.Base ? id : (eui.Engine._set[id] || null);
	},
	
	/**
	 * 初始化一个节点树
	 * @method eui.Engine.init
	 * @static
	 * 
	 * @param {Element} nodeTree
	 * 
	 * @return {Number}
	 */
	setup: function (nodeTree, context) {
		var Engine = eui.Engine;
		var nodeSet = (nodeTree || document).getElementsByTagName('*'),
			queue = [],
			context = context || {};
		var count = 0;
		for (var i = nodeSet.length - 1; i >= 0; i--) {
			queue.push(nodeSet[i]);
		}
		for (var i = queue.length - 1; i >= 0; i--) {
			Engine.make(queue[i], context) && count++;
		}
		
		return count;
	},
	
	/**
	 * 构建一个节点
	 * @method eui.Engine.make
	 * @static
	 * 
	 * @param {Element} node
	 * 
	 * @return {Object}
	 */
	make: function (node, context) {
		var Engine = eui.Engine,
			ui = node.getAttribute(Engine.UI_ATTR_KEY),
			ret = null;
		if (ui) {
			var data = js.dom.Style.parseJSON(ui);
			data.wrapId = node.id || (node.id = js.util.Global.guid(Engine.UI_ATTR_KEY));
			ret = Engine.create(data, context);
		}
		return ret;
	},
	
	/**
	 * 通过一个数据对象来创建一个组件
	 * @method eui.Engine.create
	 * @static
	 * 
	 * @param {Object} data
	 * @param {Object} context
	 * 
	 * @return {Object}
	 */
	create: function (data, context) {
		var type = js.util.Namespace.get(data.type);
		if (type) {
			var id = data.id;
			if (context && context[id]) {
				js.util.Class.mix(data, context[id]);
			}
			delete data.type;
			return new type(data);
		}
		return null;
	},
	
	/**
	 * 注册一个UI对象
	 * @param {Object} object
	 */
	register: function (object) {
		eui.Engine._set[object.id] = object;
		// object.render();
		object.autoRender && js.dom.Stage.ready(object.render, object);
	},
	
//	anchor: function (node) {
//		var ret;
//		for (var n = node.parentNode; n && n != document.body.parentNode; n = n.parentNode) {
//			var ui = n.getAttribute(this.UI_ATTR_KEY);
//			if (ui) {
//				var data = elf.dom.Style.parseJSON(ui);
//				if (data.id) {
//					ret = data.id;
//					break;
//				}
//			}
//		}
//		return ret;
//		stack.push(node);
//		if (current && current == node.nextSibling || current == node.parentNode) {
//			stack.pop(node);
//		}
//	},
	
	/**
	 * 在一个节点插入一段html并初始化这个节点树
	 * @method eui.Engine.insert
	 * @static
	 * 
	 * @param {String} wrapId
	 * @param {String} html
	 */
	insert: function (wrapId, html) {
		var
			me = eui.Engine,
			wrap = document.getElementById(wrapId);
			
		if (wrap) {
			wrap.innerHTML = html;
			
			setTimeout(function () {
				me.setup(document.getElementById(wrapId));
			}, 0);
		}
		
		wrap = null;
	}
};