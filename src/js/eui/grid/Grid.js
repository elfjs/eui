///import js.util.Class;
///import js.text.Template;
///import js.util.Global;



/**
 * DOM组视图基类
 * @Abstract Class
 */
var DOMGroupView = js.util.Class.create({
//	wrapId: '',
//	index: 0,
//	wrapTpl: '',
//	children: [],

//	createChild: null,
	
	/**
	 * 获取索引为index的子级对象，若不存在则返回null
	 * @param {Int} index
	 * @return {DOMGroupView|null}
	 */
	getChild: function (index) {
		return this.children[index] || null;
	},
	
	/**
	 * 获取对象管理的DOM节点
	 * @return {Element}
	 */
	getDOM: function () {
		return document.getElementById(this.wrapId);
	},
	
	/**
	 * 更新数据并视情况刷新视图
	 * @param {Object} data 数据对象
	 * @param {Boolean} autoRender 是否自动重绘 如true则在更新数据后自动重绘视图
	 */
	updateData: function (data, autoRender) {
		//子级自动重绘规则：本级强制true时为false，其他与本级同
		var childAutoRender = autoRender === true ? false : autoRender;
		
		//如果数据对象的类型是数组，则默认认为该数据需要传递给子级对象
		if (data instanceof Array) {
			//遍历每个子级更新数据
			for (var i = 0, len = data.length; i < len; i++) {
				//如果子级对象不存在，则使用工厂方法创建子级对象
				if (!this.children[i]) {
					this.children.push(this.createChild({
						index: i,
						parentId: this.wrapId,
						parentView: this
					}));
				}
				this.children[i].updateData(data[i], childAutoRender);
			}
			
			//子级元素个数多余数据条目则销毁多余的子级
			while (this.children.length > i) {
				this.children.pop().destruct();
			}
		}
		
		this._data = data;
		
		//如果需要自动重绘，则重绘视图
		if (autoRender) {
			this.render();
		}
	},
	
	/**
	 * 创建HTML的内容部分(除外围之外的)
	 * @return {String}
	 */
	createContentHTML: function () {
		var html = [];
		for (var i = this.children.length - 1; i >= 0; i--) {
			html.unshift(this.children[i].createHTML(true));
		}
		return html.join('');
	},
	
	/**
	 * 创建视图上要附着的属性对象
	 * @return {Object}
	 */
	createProperty: function () {
		//默认给元素额外添加的属性只有id
		return {id: this.wrapId};
	},
	
	/**
	 * 构造渲染外围模板的内容数据
	 * 以供扩展模板内容的接口
	 * @param {Object} data 默认会传入的内容数据对象
	 * @return {Object}
	 */
	createTemplateData: function (data) {
		return data;
	},
	
	/**
	 * 创建视图的HTML代码
	 * @param {Object} withWrap
	 * @return {String}
	 */
	createHTML: function (withWrap) {
		var html = this.createContentHTML();
		
		var property = this.createProperty();
		
		if (withWrap) {
			var prop = [];
			for (var i in property) {
				prop.push(i + '="' + property[i] + '"');
			}
			html = js.text.Template.format(this.wrapTpl, this.createTemplateData({content: html, property: prop.join(' ')}));
		} else {
			this.setProperty(property);
		}
		
		return html;
	},
	
	/**
	 * 绘制内容(除外围)
	 * @description 一般只有作为顶级view控制层的时候会被调用；其他只有在指定更新当前view层时会被调用
	 */
	render: function () {
		var dom = this.getDOM();
		if (dom) {
			dom.innerHTML = this.createHTML();
		}
	},
	
	/**
	 * 设置当前视图的属性
	 * @param {Object} property 属性的键值对对象
	 */
	setProperty: function (property) {
		var dom = this.getDOM();
		if (dom) {
			for (var i in property) {
				dom.setAttribute(i, property[i]);
			}
		}
		dom = null;
	},
	
	constructor: function (args) {
		var args = args || {};
		args.wrapId = args.wrapId ? args.wrapId : js.util.Global.guid((args.parentId || '') + '_');
		js.util.Class.extend(this, args);
		this.children = [];
	},
	
	destruct: function () {
		for (var i = this.children.length - 1; i >= 0; i--) {
			this.children[i].destruct();
		}
		
		this._data = null;
		
		var dom = this.getDOM();
		dom.innerHTML = '';
		dom.parentNode.removeChild(dom);
		dom = null;
	}
});

DOMGroupView.Factory = function (type) {
	var me = this;
	return function (args) {
		return new (type || me)(args);
	}
};



(function () {
//Package
var grid = window.grid = {
	CLASS_CELL: 'grid-cell',
	CLASS_ROW: 'grid-row',
	CLASS_GRID: 'grid',
	
	TAG_TBODY: 'tbody',
	TAG_THEAD: 'thead',
	TAG_TFOOT: 'tfoot',
	TAG_CELL: 'td',
	TAG_HEADER_CELL: 'th'
};

var Cell = grid.Cell = js.util.Class.create({
	wrapTpl: '<#{tag} #{property}>#{content}</#{tag}>',
	
	updateData: function (data, autoRender) {
		this._data = data;
		
		if (autoRender) {
			this.render();
		}
	},
	
	createContentHTML: function () {
		var dataKey = this.column.dataKey;
		var cellData = typeof dataKey == 'function' ? dataKey(this._data) : this._data[dataKey];
		
		return cellData || '&nbsp;';
	},
	
	createProperty: function () {
		return js.util.Class.extend(DOMGroupView.prototype.createProperty.call(this), this.column.property, 1);
	},
	
	createTemplateData: function (data) {
		return js.util.Class.extend(data, {tag: this.cellTag});
	},
	
	constructor: function (args) {
		DOMGroupView.prototype.constructor.call(this, args);
		
		if (!this.cellTag) {
			this.cellTag = grid.TAG_CELL;
		}
	}
}, DOMGroupView);



/**
 * 表格行类
 */
var Row = grid.Row = js.util.Class.create({
	wrapTpl: '<div #{property}>#{content}</div>',
	
	updateData: function (data, autoRender) {
		var autoRender = autoRender;
		
		//子级自动重绘规则：本级强制true时为false，false时与本级同
		var childAutoRender = autoRender === true ? false : autoRender;
		
		var column = this.column;
		
		for (var i = 0, len = column.length; i < len; i++) {
			this.children[i].updateData(data, childAutoRender);
		}
		
		this._data = data;
		
		if (autoRender) {
			this.render();
		}
	},
	
	createContentHTML: function () {
		var html = [];
		for (var i = this.children.length - 1; i >= 0; i--) {
			html.unshift(this.children[i].createHTML(true));
		}
		html.unshift('<table cellspacing="0" cellpadding="0" border="0"><', this.groupTag, '><tr>');
		html.push('</tr></', this.groupTag, '></table>');
		
		return html.join('');
	},
	
	constructor: function (args) {
		DOMGroupView.prototype.constructor.call(this, args);
		
		if (!this.groupTag) {
			this.groupTag = grid.TAG_TBODY;
		}
		
		var column = this.column;
		
		for (var i = 0, len = column.length; i < len; i++) {
			this.children.push(this.createChild({
				index: i,
				column: column[i],
				parentId: this.wrapId,
				parentView: this
			}));
		}
	}
}, DOMGroupView);



/**
 * 网格矩阵 = 行组
 */
var Grid = grid.Grid = js.util.Class.create({
//	CellType: Cell,
//	RowType: Row,
	
	wrapTpl: '<div #{property}>#{content}</div>',
	
	createChild: function (args) {
		return new this.RowType(js.util.Class.extend({
			column: this.column
		}, args));
	},
	
	constructor: function (args) {
		var args = args || {};
		
		//通过创建一个新的继承类来避免原类的prototype被改变
		this.CellType = args.CellType || Cell;
		
		
		
		this.RowType = js.util.Class.create({
			createChild: DOMGroupView.Factory(this.CellType)
		}, args.RowType || Row);
		
		//this.createChild = DOMGroupView.Factory.call(this.RowType);
		
		delete args.RowType;
		delete args.CellType;
		
		DOMGroupView.prototype.constructor.call(this, args);
	}
}, DOMGroupView);




//////////////////////////////
// 可以用工厂模式代替这两个类的定义
// js类的继承应该继承类对象上的属性么？
// 暂时先这么着吧
//////////////////////////////

/**
 * 表头单元格类，继承自Cell
 */
var HeaderCell = grid.HeaderCell = js.util.Class.create({
	cellTag: grid.TAG_HEADER_CELL,
	
	createContentHTML: function (withWrap) {
		var header = this.column.header;
		return (typeof header == 'function' ? header() : header) || '&nbsp;';
	}
}, Cell);

/**
 * 表格表头行类，继承自Row
 */
var HeaderRow = grid.HeaderRow = js.util.Class.create({
	groupTag: grid.TAG_THEAD,
	
	updateData: function(data, autoRender) {
		if (autoRender) {
			this.render();
		}
	}
}, Row);

/**
 * 可扩展的表格行类
 */
var XRow = grid.XRow = js.util.Class.create({
//	HeadViewType: null,
//	FootViewType: null,
	
	updateData: function (data, autoRender) {
		//子级自动重绘规则：本级强制true时为false，false时与本级同
		var childAutoRender = autoRender === true ? false : autoRender;
		
		//如果有头部视图
		if (this.headView) {
			this.headView.updateData(data, childAutoRender);
		}
		//如果有尾部视图
		if (this.footView) {
			this.footView.updateData(data, childAutoRender);
		}
		
		Row.prototype.updateData.call(this, data, autoRender);
	},
	
	createContentHTML: function (withWrap) {
		var html = [Row.prototype.createContentHTML.call(this)];
		
		if (this.headView) {
			html.unshift(this.headView.createHTML(true));
		}
		
		if (this.footView) {
			html.push(this.footView.createHTML(true));
		}
		
		return html.join('');
	},
	
	constructor: function (args) {
		var args = args || {};
		
		Row.prototype.constructor.call(this, args);
		
		if (typeof this.createHeader == 'function') {
			this.headView = this.createHeader({
				parentId: this.wrapId,
				parentView: this
			});
		}
		if (typeof this.createFooter == 'function') {
			this.footView = this.createFooter({
				parentId: this.wrapId,
				parentView: this
			});
		}
	}
}, Row);



/**
 * 可供其他组件合并调用的整体表格，但不提供任何事件控制和交互功能，仅作为视图，控制逻辑需要另行添加
 */
var GridView = grid.GridView = js.util.Class.create({
	wrapTpl: '<div #{property}>#{content}</div>',
	
	/**
	 * 获取表头对象
	 */
	getHeader: function () {
		return this.header || null;
	},
	
	/**
	 * 根据索引获取某个行对象
	 * @param {Integer} index
	 */
	getRow: function (index) {
		return this.grid.getChild(index);
	},
	
	/**
	 * 更新数据的外部接口
	 * @param {Object} data 数据对象
	 * @param {Boolean} autoRender 是否自动重绘
	 */
	updateData: function (data, autoRender) {
		this.grid.updateData(data);
		this.render();
	},
	
	createContentHTML: function () {
		return [this.header.createHTML(true), this.grid.createHTML(true)].join('');
	},
	
	constructor: function (args) {
		var args = args || {};
		
		var HeaderType = this.HeaderType || HeaderRow;
		var HeaderCellType = this.HeaderCellType || HeaderCell;
		
		var GridType = this.GridType || Grid;
		
		js.util.Class.extend(this, args);
		
		this.header = new HeaderType({
			column: args.column,
			parentId: this.wrapId,
			parentView: this,
			createChild: DOMGroupView.Factory(HeaderCellType)
		});
		
		this.grid = new GridType({
			RowType: args.RowType,
			CellType: args.CellType,
			column: args.column,
			parentId: this.wrapId,
			parentView: this
		});
	}
}, DOMGroupView);

})();



/**
 * 界面模块控制类
 * @Abstract Class
 */
var UIModule = js.util.Class.create({
	//控制的视图元件，该元件仅负责展现层逻辑
//	view: {},
	//状态元集合
//	status: {},
	//更新状态时发送的预设规则标识
//	prefer: '',
	//更新UI视图的操作
//	updateStatus: nothing,
	
	/**
	 * 获取指定的状态元或全部状态集
	 * @param {String} key
	 */
	getStatus: function(key){
		return key ? this.status[key] : this.status;
	},
	
	/**
	 * 当状态发生改变时向管理器发送新状态的外部接口，外部实现，内部调用
	 * @param {Object} args
	 */
	sendStatus: null,
	
	constructor: function(args){
		var args = args || {};
		this.prefer = '';
		this.status = {};
		js.util.Class.extend(this, args);
	}
});



var DataGrid = js.util.Class.create({
	constructor: function (args) {
		UIModule.prototype.constructor.call(this, args);
	}
}, UIModule);



var ColumnSortor = js.util.Class.create({
	
	
	constructor: function (args) {
		UIModule.prototype.constructor.call(this, args);
		
		var me = this;
		
		
	}
}, UIModule);



var DataSet = js.util.Class.create({
	sort: function (field, method) {
		
	},
	load: function () {
		
	},
	operate: function (command, option) {
		
	},
	constructor: function (data) {
		this.data = data;
	}
});

