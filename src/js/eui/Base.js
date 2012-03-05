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

eui.Base = js.util.Class.create({
	/**
	 * 构造函数
	 */
	constructor: js.util.Class.copy({
		TYPE: 'Base',
		AUTO_RENDER: true,
		DISABLED: false,
		WRAP_TAG: 'div',
		
		TPL_WRAP: '<#{tag} #{attributes}>#{content}</#{tag}>',
		TPL_CONTENT: '',
		
		CLASS_DISABLED: 'disabled',
		CLASS_HOVER: 'hover',
		CLASS_PRESS: 'press',
		
		EVENT_CLICK: 'click',
		EVENT_MOUSE_OVER: 'mouseover',
		EVENT_MOUSE_OUT: 'mouseout',
		EVENT_MOUSE_DOWN: 'mousedown',
		EVENT_MOUSE_UP: 'mouseup',
		
		/**
		 * @enum
		 * @static
		 * @property eui.Base.OptionsParser 参数解析器集合
		 * @type {Object}
		 */
		OptionsParser: {
			disabled: eui.OptionsParser.toBoolean
		}
	}, function(args){
		js.util.Class.copy(this.getConfig(), this);
		
		this.parseOptions(args);
		
		eui.Engine.register(this);
	}),
	
	/**
	 * 解析参数
	 * 将调用参数解析器集合中的对应解析器完成解析
	 * @param {Object} args
	 */
	parseOptions: function (args) {
		var myClass = this.constructor;
		for (var i in args) {
			var arg = args[i];
			var parser = myClass.OptionsParser[i];
			if (js.util.Type.isDefined(arg)) {
				this[i] = parser ? parser.call(this, arg, i, args) : arg;
			}
		}
	},
	
	/**
	 * 获取默认参数
	 * 
	 * @return {Object}
	 */
	getConfig: function () {
		var myClass = this.constructor;
		return {
			id: js.util.Global.guid(eui.Engine.UI_ATTR_KEY),
			type: myClass.TYPE,
			autoRender: myClass.AUTO_RENDER,
			disabled: myClass.DISABLED,
			tagWrap: myClass.WRAP_TAG,
			tplWrap: myClass.TPL_WRAP,
			tplContent: myClass.TPL_CONTENT,
			classDisabled: (myClass.CLASS_DISABLED),
			classHover: (myClass.CLASS_HOVER),
			classPress: (myClass.CLASS_PRESS)
		};
	},
	
	/**
	 * 渲染组件的入口，创建时会由引擎调用自动渲染
	 */
	render: function () {
		var me = this;
		var wrap = me.getWrap();
		if (!me.rendered) {
			if (!wrap) {
				wrap = me.createWrap();
			} else {
				js.dom.Attribute.set(wrap, me.createWrapAttributes());
			}
			me.rendered = true;
		} else {
			wrap.innerHTML = me.createHTML();
		}
	},
	
	/**
	 * 把使用new创建的组件追加到DOM树的某个节点下
	 * @param {Element} element
	 */
	insertBefore: function (element) {
		js.dom.Operation.insertBefore(this.getWrap(), element);
		this.main = null;
		// elf(function (elem) {
			// js.dom.Operation.insertBefore(this.getWrap(), elem);
			// this.main = null;
		// }, this, element);
	},
	
	/**
	 * 把使用new创建的组件追加到DOM树的某个节点下
	 * @param {Element} element
	 */
	appendTo: function (element) {
		// element.appendChild(this.getWrap());
		// this.main = null;
		elf(function (elem) {
			js.dom.Operation.append(this.getWrap(), elem);
			this.main = null;
		}, this, element);
	},
	
	/**
	 * @private
	 * 创建外围元素的属性对象
	 * 
	 * @return {Object}
	 */
	createWrapAttributes: function () {
		return {
			id: this.wrapId || (this.wrapId = js.dom.Stage.mark({})),
			'class': this.getClassName(),
			onclick: this.getHTMLCallString('_handlerClick'),
			onmouseover: this.getHTMLCallString('_handlerMouseOver'),
			onmouseout: this.getHTMLCallString('_handlerMouseOut'),
			onmousedown: this.getHTMLCallString('_handlerMouseDown'),
			onmouseup: this.getHTMLCallString('_handlerMouseUp')
		};
	},
	
	/**
	 * @private
	 * 创建外围元素对象
	 * 
	 * @return {Element}
	 */
	createWrap: function () {
		this.main = js.dom.Operation.create(this.tagWrap, this.createWrapAttributes());
		this.main.innerHTML = this.createHTML();
		return this.main;
	},
	
	/**
	 * 创建视图的HTML代码
	 * @param {Boolean} withWrap
	 * 
	 * @return {String}
	 */
	createHTML: function (withWrap) {
		var html = this.createContentHTML();
		
		if (withWrap) {
			var attrs = this.createWrapAttributes();
			var prop = [];
			for (var i in attrs) {
				prop.push(i + '="' + attrs[i] + '"');
			}
			html = js.text.Template.format(this.tplWrap, {content: html, attributes: prop.join(' ')});
		}
		
		return html;
	},
	
	/**
	 * 创建HTML的内容部分(除外围之外的)
	 * @return {String}
	 */
	createContentHTML: function () {
		return this.tplContent;
	},
	
	/**
	 * 获取生成控件的外围元素
	 * 
	 * @return {Element}
	 */
	getWrap: function () {
		return document.getElementById(this.wrapId) || this.main;
	},
	
	/**
	 * 获取classname
	 * 
	 * @param {String} name
	 * 
	 * @return {String}
	 */
	getClassName: function (name) {
		var classBase = eui.Engine.UI_ATTR_KEY + '-' + this.type;
		return (name ? classBase + '-' + name : classBase).toLowerCase();
	},
	
	/**
	 * 获取得到组件自身的代码字符串
	 * 
	 * @return {String}
	 */
	getHTMLReferString: function () {
		return 'eui("' + this.id + '")';
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
		js.dom.ClassName.toggle(this.getWrap(), this.classDisabled, disabled);
	},
	
	_handlerClick: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_CLICK) === false) {
			ev.preventDefault();
			return false;
		}
	},
	
	_handlerMouseOver: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_MOUSE_OVER) === false) {
			ev.preventDefault();
			return false;
		}
		js.dom.ClassName.add(this.getWrap(), this.getClassName(this.classHover));
	},
	
	_handlerMouseOut: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_MOUSE_OUT) === false) {
			ev.preventDefault();
			return false;
		}
		js.dom.ClassName.remove(this.getWrap(), this.getClassName(this.classHover));
	},
	
	_handlerMouseDown: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_MOUSE_DOWN) === false) {
			ev.preventDefault();
			return false;
		}
		js.dom.ClassName.add(this.getWrap(), this.getClassName(this.classPress));
	},
	
	_handlerMouseUp: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_MOUSE_UP) === false) {
			ev.preventDefault();
			return false;
		}
		js.dom.ClassName.remove(this.getWrap(), this.getClassName(this.classPress));
	}
}, null, js.util.IEventDispatcher);

js.util.Class.implement(eui.Base, {
	on: eui.Base.prototype.addEventListener,
	un: eui.Base.prototype.removeEventListener
});
