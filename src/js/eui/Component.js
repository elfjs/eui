/*
 * eui JavaScript Library
 * 
 * create: 
 * @2011-07-28 by mytharcher
 * 
 * update:
 */

///import js.util.Class;
///import js.util.Namespace;
///import js.util.Type;
///import js.util.EventDispatcher;
///import js.dom.Stage.mark;
///import js.dom.Operation;
///import js.text.Template;
///import eui.Engine;

eui.Component = js.util.Class.create({
	type: 'component',
	autoRender: true,
	disabled: false,
	defaultEvents: '',
	mainTag: 'div',
	mainTpl: '<#{tag} #{attributes}>#{content}</#{tag}>',
	content: '',
	classDisabled: 'disabled',
	classHover: 'hover',
	classPress: 'pressing',
	
	/**
	 * 构造函数
	 */
	constructor: js.util.Class.copy({
		EVENT_CLICK: 'click',
		EVENT_MOUSE_OVER: 'mouseover',
		EVENT_MOUSE_OUT: 'mouseout',
		EVENT_MOUSE_DOWN: 'mousedown',
		EVENT_MOUSE_UP: 'mouseup'
	}, function(args){
		this.parseOptions(args);
		
		!this.id && (this.id = js.util.Global.guid(eui.Engine.UI_ATTR_KEY)),
		
		eui.Engine.register(this);
	}),
	
	/**
	 * 解析参数
	 * 将调用参数解析器集合中的对应解析器完成解析
	 * @param {Object} args
	 */
	parseOptions: function (args) {
		var OptionsParser = eui.Engine.OptionsParser;
		for (var i in args) {
			var arg = args[i];
			var parser = OptionsParser[i];
			if (js.util.Type.isDefined(arg)) {
				this[i] = parser ? parser.call(this, arg, i, args) : arg;
			}
		}
	},
	
	/**
	 * 应用原生DOM属性
	 * 
	 * @param {String..} attrName 属性名列表
	 */
	applyNativeAttribute: function () {
		var attrs = [].slice.call(arguments, 0);
		var main = this.getMain();
		attrs.forEach(function (item) {
			var value = this[item];
			if (value) {
				main.setAttribute(item, value);
			} else {
				this[item] = main.getAttribute(item);
			}
		}, this);
	},
	
	/**
	 * 渲染组件的入口，创建时会由引擎调用自动渲染
	 */
	render: function () {
		var me = this;
		var main = me.getMain();
		var first = !me.rendered;
		
		if (first) {
			if (!main) {
				main = me.createMain();
			} else {
				me.applyAttributesToMain();
			}
			main.setAttribute(eui.Engine.UI_ID_ATTR, me.id);
			me.rendered = true;
		}
		
		me.setDisabled(me.disabled);
		
		return first;
	},
	
	/**
	 * 把使用new创建的组件追加到DOM树的某个节点下
	 * @param {Element} element
	 */
	insertBefore: function (element) {
		js.dom.Operation.insertBefore(this.getMain(), element);
		this.main = null;
		// elf(function (elem) {
			// js.dom.Operation.insertBefore(this.getMain(), elem);
			// this.main = null;
		// }, this, element);
	},
	
	/**
	 * 把使用new创建的组件追加到DOM树的某个节点下
	 * @param {Element} element
	 */
	appendTo: function (element) {
		// element.appendChild(this.getMain());
		// this.main = null;
		js.dom.Stage.ready(function (elem) {
			js.dom.Operation.append(this.getMain(), elem);
			this.main = null;
		}, this, element);
	},
	
	/**
	 * @private
	 * 创建外围元素的属性对象
	 * 
	 * @return {Object}
	 */
	createMainAttributes: function () {
		var attrs = {
			id: this.mainId || (this.mainId = js.dom.Stage.mark({})),
			'class': this.getClassName()
		};
		var events = this.defaultEvents.toString().split(',');
		if (events.length) {
			events.forEach(function (item) {
				attrs['on' + item] = this.getHTMLCallString('_handle' + item);
			}, this);
		}
		return attrs;
	},
	
	applyAttributesToMain: function () {
		js.dom.Attribute.set(this.getMain(), this.createMainAttributes());
	},
	
	/**
	 * 应用原生元素属性
	 * 
	 * 优先级：ui属性 > 原生属性
	 */
	applyNativeAttributes: function () {
		var attrs = [].slice.call(arguments, 0).toString().split(',');
		var main = this.getMain();
		var attr;
		
		if (main) {
			for (var i = attrs.length - 1; (attr = attrs[i--]); ) {
				var value = this[attr];
				if (typeof value != 'undefined') {
					main.setAttribute(attr, value);
				} else if ((value = main.getAttribute(attr)) !== null) {
					this[attr] = value;
				}
			}
		}
	},
	
	/**
	 * @private
	 * 创建外围元素对象
	 * 
	 * @return {Element}
	 */
	createMain: function () {
		this.main = js.dom.Operation.create(this.mainTag, this.createMainAttributes());
		this.createContent();
		return this.main;
	},
	
	/**
	 * 创建主元素内容
	 */
	createContent: function () {
		var main = this.getMain();
		main.innerHTML = this.createHTML();
	},
	
	/**
	 * 创建视图的HTML代码
	 * @param {Boolean} withMain
	 * 
	 * @return {String}
	 */
	createHTML: function (withMain) {
		var html = this.createContentHTML();
		
		if (withMain) {
			var attrs = this.createMainAttributes();
			var prop = [];
			for (var i in attrs) {
				prop.push(i + '="' + attrs[i] + '"');
			}
			html = js.text.Template.format(this.mainTpl, {content: html, attributes: prop.join(' ')});
		}
		
		return html;
	},
	
	/**
	 * 创建HTML的内容部分(除外围之外的)
	 * @return {String}
	 */
	createContentHTML: function () {
		return this.content;
	},
	
	/**
	 * 获取生成控件的外围元素
	 * 
	 * @return {Element}
	 */
	getMain: function () {
		return document.getElementById(this.mainId) || this.main;
	},
	
	/**
	 * 获取classname
	 * 
	 * @param {String} name
	 * 
	 * @return {String}
	 */
	getClassName: function (name) {
		var classComponent = eui.Engine.UI_ATTR_KEY + '-' + this.type;
		return (name ? classComponent + '-' + name : classComponent).toLowerCase();
	},
	
	/**
	 * 获取得到组件自身的代码字符串
	 * 
	 * @return {String}
	 */
	getHTMLReferString: function () {
		return "eui('" + this.id + "')";
	},
	
	/**
	 * 获取自身事件函数调用的代码字符串
	 * 
	 * @param {String} handler 函数名
	 * 
	 * @return {String}
	 */
	getHTMLCallString: function (handler) {
		return 'return ' + this.getHTMLReferString() + '.' + handler + '(event);';
	},
	
	/**
	 * 派发事件
	 * 
	 * @param {String} type 事件类型标识串
	 * @param {Object} data 事件相关数据
	 * 
	 * @return {Boolean}
	 */
	dispatchEvent: function (type, data) {
		return this.disabled ?
			false
			: js.util.EventDispatcher.prototype.dispatchEvent.apply(this, arguments);
	},
	
	/**
	 * 设置组件的可用状态
	 * @param {Boolean} disabled false为可用，true为不可用
	 */
	setDisabled: function (disabled) {
		this.disabled = disabled;
		js.dom.ClassName.toggle(this.getMain(), this.getClassName(this.classDisabled), disabled);
	},
	
	enable: function () {
		this.setDisabled(false);
	},
	
	disable: function () {
		this.setDisabled(true);
	}
}, null, js.util.IEventDispatcher);

js.util.Class.implement(eui.Component, {
	on: eui.Component.prototype.addEventListener,
	un: eui.Component.prototype.removeEventListener
});
