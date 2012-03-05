/**
 * DOM视图的叶子节点，不包含任何子级
 */
var DOMView = js.util.Class.create({
//	subView: sDOMView,
	getDOM: function() {
		return document.getElementById(this.wrapId);
	},
	
	updateData: function (data, autoRender) {
		var autoRender = autoRender;
		if (!this.rendered) {
			autoRender = true;
		}
		//数据是否发生了改变的标志位
		var atomChanged = false;
		
		if (this._data != data) {
			atomChanged = true;
		}
		
		this._data = data;
		
		if (autoRender === true || (atomChanged && typeof autoRender == 'undefined')) {
			this.render();
		}
	},
	
	createHTML: function (withWrap) {
		
	},
	
	render: function () {
		var dom = this.getDOM();
		if (dom) {
			dom.innerHTML = this.createHTML();
		}
	},
	
	constructor: function (args) {
		var args = args || {};
		args.wrapId = args.wrapId ? args.wrapId : ((args.parentId || '') + guid('_'));
		js.util.Class.extend(this, args);
	}
});

/**
 * DOM组视图基类
 */
var DOMGroupView = js.util.Class.create({
//	wrapId: '',
	index: 0,
//	tamplate: '',
//	childType: DOMGroupView, ///// 造成串联
//	subViewType: null, ///// 造成串联
//	children: [],
//	subView: {},
	
	createChild: function (type) {
		var type = type || this.childType;
		var args = {
			index: this.children.length,
			structure: this.structure,
			parentId: this.wrapId,
			parentView: this
		};
		return new type(args);
	},
	
	updateData: function (data, autoRender) {
		var autoRender = autoRender;
		
		//子级自动重绘规则：本级强制true时为false，false时与本级同，
		var subAutoRender = autoRender === true ? false : autoRender;
		//数据是否发生了改变的标志位
		var atomChanged = false;
		
		if (data instanceof Array) {
			var count = 0;
			//遍历每个子级更新数据
			for (var count = 0, len = data.length; count < len; count++) {
				if (!this.children[count]) {
					this.children.push(this.createChild());
				}
				this.children[count].updateData(data[key], subAutoRender);
			}
			
			//子级元素个数多余数据条目则销毁多余的子级
			while (this.children.length > count) {
				this.children.pop().destruct();
			}
		} else {
			if (this._data != data) {
				atomChanged = true;
			}
		}
		
		this._data = data;
		
		if (autoRender === true || (atomChanged && typeof autoRender == 'undefined')) {
			this.render();
		}
	},
	
	createHTML: function (withWrap) {
		var html = [];
		for (var i = this.children.length - 1; i >= 0; i--) {
			html.unshift(this.children[i].createHTML(true));
		}
		
		var subViewHTML = this.subView ? this.subView.createHTML(true) : '';
		
		html[this.subOrder ? 'push' : 'unshift'](subViewHTML);
		
		html = html.join('');
		
		//默认给元素额外添加的属性只有id
		var property = {id: this.wrapId};
		if (withWrap) {
			var prop = [];
			for (var i in property) {
				prop.push(i + '="' + property[i] + '"');
			}
			html = template(this.template, {content: html, property: prop.join(' ')});
		} else {
			var dom = this.getDOM();
			if (dom) {
				for (var i in property) {
					dom.setAttribute(i, property[i]);
				}
			}
		}
		
		return html;
	},
	
	render: function () {
		var dom = this.getDOM();
		if (dom) {
			dom.innerHTML = this.createHTML();
		}
	},
	
	constructor: function (args) {
		var args = args || {};
		args.wrapId = args.wrapId ? args.wrapId : ((args.parentId || '') + guid('_'));
		js.util.Class.extend(this, args);
		this.children = [];
	},
	
	destruct: function (clearHTML) {
		for (var i = this.children.length - 1; i >= 0; i--) {
			this.children[i].destruct();
		}
		if (this.subView) {
			this.subView.destruct();
		}
		if (clearHTML) {
			this.getDOM().innerHTML = '';
		}
		this._data = null;
	}
});
DOMGroupView.getChildCreator = function (type) {
	return function (args) {
		return new type(args);
	}
};



(function () {
//Package
var grid = window.grid = {};

var Cell = grid.Cell = js.util.Class.create({
	template: '<{tag} {property}>{content}</{tag}>',
	createHTML: function (withWrap) {
		var columnStruct = this.structure[this.parentView.parentView.index].struct[this.index];
		var cellData = typeof this._data != 'undefined' ? this._data : columnStruct.text;
		var tpl = columnStruct.template;
		cellData = typeof cellData != 'undefined' ? (tpl ? template(tpl, cellData) : cellData) : '&nbsp;'
		var html = [cellData];
		
		this.subView && html.push(this.subView.createHTML(true));
		
		html = html.join('');
		
		var property = js.util.Class.extend({id: this.wrapId}, columnStruct.property, 1);
		
		//如果是包含外围标签的创建
		if (withWrap) {
			var prop = [];
			for (var i in property) {
				prop.push(i + '="' + property[i] + '"');
			}
			html = template(this.template, {content: html, tag: this.cellTag, property: prop.join(' ')});
		} else {
			var dom = this.getDOM();
			if (dom) {
				for (var i in property) {
					dom.setAttribute(i, property[i]);
				}
			}
		}
		return html;
	},
	
	constructor: function (args) {
		this.superClass.call(this, args);
		var columnStruct = this.structure[this.parentView.parentView.index];
		this.cellTag = columnStruct.struct[this.index].cellTag || columnStruct.property.cellTag || 'td';
	}
}, DOMGroupView);
js.util.Class.extend(Cell, {
	CLASS_CELL: 'grid-cell'
});



/**
 * 表格行类
 */
var Row = grid.Row = js.util.Class.create({
	childType: Cell,
//	subViewType: Grid,
	template: '<div {property}>{content}</div>',
	createHTML: function (withWrap) {
		var html = [];
		for (var i = this.children.length - 1; i >= 0; i--) {
			html.unshift(this.children[i].createHTML(true));
		}
		html.unshift('<table cellspacing="0" cellpadding="0" border="0"><', this.groupTag, '><tr>');
		html.push('</tr></', this.groupTag, '></table>');
		
		this.subView && html.push(this.subView.createHTML(true));
		
		html = html.join('');
		return withWrap ? template(this.template, {content: html}) : html;
	},
	constructor: function (args) {
		this.superClass.call(this, args);
		this.groupTag = this.structure[this.parentView.index].property.rowGroupTag || 'tbody';
	}
}, DOMGroupView);
js.util.Class.extend(Row, {
	CLASS_ROW: 'grid-row'
});

/**
 * 表格
 */
var Grid = grid.Grid = js.util.Class.create({
	childType: Row,
	template: '<div {property}>{content}</div>'
}, DOMGroupView);



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





