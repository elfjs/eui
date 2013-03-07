/**
 * 多功能表单类
 */
eui.form.Form = js.util.Class.create({
	type: 'form',
	mainTag: 'form',
	defaultEvents: 'submit,reset',
	
	constructor: js.util.Class.copy({
		EVENT_SUBMIT: 'submit',
		EVENT_RESET: 'reset'
	}, function (options) {
		eui.Component.call(this, options);
	}),
	
	render: function () {
		var me   = this;
		var main = me.getMain();
		var domEvent = js.dom.Event;
		
		if (!me.rendered) {
			me.applyNativeAttributes('action', 'method');
			me.url = me.action;
			
			if (me.useAjax) {
				me.xhr = new js.net.Ajax(js.util.Class.mix({},
					me, Object.keys(js.net.Ajax.option)));
				
			}
		}
		
		eui.form.Form.__super__.render.call(me);
	},
	
	/**
	 * 循环迭代器
	 * @param {Function} fn
	 * @param {Object} scope
	 * @param {Any...}
	 */
	forEachField: function (fn, scope) {
		var args = [].slice.call(arguments, 2),
			fields = eui.Egnine.getComponentsByContainer(this.getMain()),
			fnProperty = typeof fn == 'string';
		scope = scope || null;
		
		for (var i = 0, len = fields.length; i < len; i++) {
			var field = fields[i];
			if (field instanceof eui.form.Field) {
				if ((fnProperty ?
						field[fn].apply(field, args) :
						fn.apply(scope, [field].concat(args))
					) === false) {
					return false;
				}
			}
		}
	},
	
	/**
	 * 提交表单
	 * @return {Boolean}
	 */
	submit: function () {
		if (this.validate()) {
			if (this.useAjax) {
				this.xhr.request(this.getData());
				return false;
			} else {
				this.getMain().submit();
			}
		} else {
			return false;
		}
	},
	
	/**
	 * 获取表单中的数据
	 * 
	 * @return {Object}
	 */
	getData: function () {
		var data = {};
		this.forEachField(this._getFieldDataIterator, this, data);
		return data;
	},
	
	/**
	 * @private
	 * 获取每个field数据的迭代器
	 * 
	 * @param {esui.InputControl} field
	 * @param {Object} ret
	 */
	_getFieldDataIterator: function (field, ret) {
		if (!field.disabled) {
			var name = field.name;
			if (name) {
				if (!ret[name]) {
					ret[name] = [];
				}
				if (!(field instanceof eui.form.GroupItem) || field.isChecked()) {
					ret[name].push(field.getValue());
				}
			}
		}
	},
	
	/**
	 * 预填表单值
	 * @param {Object} data
	 * @param {Object} filterMap 特殊处理过滤器表
	 */
	setData: function (data, filterMap) {
		this.forEachField(this._setFieldDataIterator, this, data, filterMap);
	},
	
	/**
	 * 预填每个域的值
	 * @private
	 * 
	 * @param {eui.form.Field} field
	 * @param {Object} data 数据集
	 * @param {Object} filterMap 特殊处理过滤器表
	 */
	_setFieldDataIterator: function (field, data, filterMap) {
		var dataItem = data[field.name];
		
		if (typeof dataItem != 'undefined') {
			var filter;
			if (filterMap && typeof (filter = filterMap[field.name]) == 'function') {
				filter.call(field, data);
			} else {
				if (field instanceof eui.form.GroupItem) {
					field.getGroup().selectByValues(dataItem.toString().split(','));
				} else {
					field.setValue(dataItem);
				}
			}
		}
	},
	
	/**
	 * 获取表单数据的查询字符串
	 * 
	 * @param {Function} encoder 编码函数
	 * 
	 * @return {String}
	 */
	getQueryString: function (encoder) {
		var data = this.getFormData(),
			query = [];
		
		for (var name in data) {
			var dataItem = data[name];
			for (var i = 0, len = dataItem.length; i < len; i++) {
				var value = typeof encoder == 'function' ? encoder(dataItem[i]) : dataItem[i];
				query.push(name + '=' + value);
			}
		}
		
		return query.join('&');
	},
	
	/**
	 * 验证表单
	 * @protected
	 * 
	 * @param {Boolean} all 是否要验证完全部才停止，默认：false
	 * @param {boolean} justCheck 是否仅验证
	 * 
	 * @return {boolean} 是否验证通过
	 */
	validate: function (all, justCheck) {
		return this.forEachField(this._validateIterator, this, justCheck, all) !== false;
	},
	
	/**
	 * 验证控件，仅返回是否验证通过
	 * 
	 * @public
	 * 
	 * @param {Boolean} all 是否要验证完全部才停止，默认：false
	 * 
	 * @return {boolean} 是否验证通过
	 */
	checkValidity: function ( all ) {
		return this.validate( all, true );
	},
	
	/**
	 * 验证表单单个域的迭代器
	 * @private
	 * 
	 * @param {esui.InputControl} field
	 * @param {Boolean} justCheck
	 * @param {Boolean} all
	 */
	_validateIterator: function (field, justCheck, all) {
		if (!field.disabled && !field.validate(justCheck) && !all) {
			return false;
		}
		
		if (!(field)) {
			
		}
	},
	
    /**
     * 恢复到验证之前的信息状态
     */
    resetValidity: function () {
        this.forEachField('resetValidity');
    },
    
    /**
     * 恢复表单到初始状态
     */
    reset: function () {
        this.forEachField('render');
    },
	
	/**
	 * 提交事件内部处理
	 * @private
	 * 
	 * @param  {DOMEvent} ev
	 */
	_handlesubmit: function (ev) {
		if (this.disabled ||
			this.dispatchEvent(this.constructor.EVENT_SUBMIT) === false ||
			this.submit() === false) {
			ev.preventDefault();
			return false;
		}
	},
	
	/**
	 * 重置事件内部处理
	 * @private
	 * 
	 * @param  {DOMEvent} ev
	 */
	_handlereset: function (ev) {
		if (this.disabled || this.dispatchEvent(this.constructor.EVENT_RESET) === false) {
			ev.preventDefault();
			return false;
		}
	}
}, eui.Component);
