(function () {
	var eui = baidu.eui;
	
	/**
	 * @private
	 */
	var lib = eui.lib;
	
	/**
	 * @private
	 */
	var euiSet = eui._euiSet;
	
	var cal = eui.calendar = eui.calendar || {};
	
	var DateGrid = cal.DateGrid = function () {
		//今天
		this._today = null;
		//当前显示的月份
		this._viewDate = null;
		//日期对象集合
		this._dateSet = null;
	};
	
	lib.extend(DateGrid, {
		WEEK_TITLE: ['日', '一', '二', '三', '四', '五', '六'],
		WEEK_START: 0,
		WEEK_FIX_ROW: 1
	});
	
	lib.extend(DateGrid.prototype, {
		//星期的标题文字
		_weekTitle: DateGrid.WEEK_TITLE,
		//星期的起始天
		_weekStart: DateGrid.WEEK_START,
		//日期排列正确的时候是否也补齐6行
		_fixRow: DateGrid.WEEK_FIX_ROW,
		
		/**
		 * 获取当前显示的日期对象
		 */
		getViewDate: function () {
			return this._viewDate;
		},
		
		/**
		 * 设置当前显示的日期对象为新的日期
		 * @param {Object} date
		 */
		_setViewDate: function (date) {
			this._viewDate = date;
		},
		
		/**
		 * 改变当前显示的日期对象为新的日期并重绘控件
		 * @param {Object} date
		 */
		changeViewDate: function (date) {
			var date = date || this._viewDate;
			this._setViewDate(date);
			this._render(date);
		},
		
		/**
		 * 获取指定时间的日期单元对象
		 * @param {Date} date
		 * 
		 * @return DateCell
		 */
		getDateCell: function (date) {
			return this._dateSet.getDateCell(date);
		},
		
		/**
		 * 重绘日历表格的接口
		 * @param {Date} viewDate 绘制日历的日期对象,某年某月
		 * @param {Object} option 传入的其他参数,如日期标识(已选择的,禁用的等)
		 */
		_render: function (viewDate) {
			var viewDate = viewDate || this._viewDate;
			
			lib.$(this._wrapperId).innerHTML = [
				'<table cellspacing="0" cellpadding="0" class="eui-cal-grid">',
				this._renderGridHeader(),
				this._renderGridBody(viewDate),
				'</table>'
			].join('');
		},
		
		_renderGridHeader: function () {
			var html = ['<thead><tr>'];
			for (var i = this._weekStart, count = 6; count >= 0; count--) {
				html.push(
					'<th class="',
					DateCell.CLASS_WEEKDAY[i],
					' ',
					(i > 0 && i < 6) ? DateCell.CLASS_WORKDAY : DateCell.CLASS_WEEKEND,
					'">',
					this._weekTitle[i],
					'</th>'
				);
				if (++i == 7) {
					i = 0;
				}
			}
			html.push('</tr></thead>');
			
			return html.join('');
		},
		
		_renderGridBody: function (viewDate) {
			var date = viewDate || this._viewDate;
			var year = date.getFullYear(), month = date.getMonth(), weekday = date.getDay();
			
			var weekStartDay = this._weekStart;
			var weekEndDay = weekStartDay - 1;
			if (weekEndDay < 0) {
				weekEndDay = 6;
			}
			
			var startDate = new Date(year, month, 1);
				startDate.setDate(startDate.getDate() + weekStartDay - startDate.getDay());
			var endDate = new Date(year, month + 1, 0);
			if (endDate.getDay() != weekEndDay) {
				endDate.setDate(endDate.getDate() + 7 - endDate.getDay() + weekStartDay);
			}
			
			if (this._fixRow) {
				if (weekday == weekStartDay) {
					startDate.setDate(startDate.getDate() - 7);
				}
				endDate = new Date(startDate.getTime() + 3628800000);
			}
			
			var dateSet = this._dateSet;
			dateSet.reset({
				viewDate: this._viewDate
			});
			
			var html = ['<tbody>'];
			
			for (var curDate = new Date(startDate.getTime()); endDate - curDate; curDate.setDate(curDate.getDate() + 1)) {
				var dateCell = dateSet.addDate(curDate);
				
				var day = curDate.getDay();
				if (day == weekStartDay) {
					html.push('<tr>');
				}
				
				html.push(dateCell.getHTML());
				
				if (day == weekEndDay) {
					html.push('</tr>');
				}
			}
			
			html.push('</tbody>');
			
			return html.join('');
		},
		
		/**
		 * 当点击日期的事件接口
		 * 
		 * 以下接口仅作为文档表示，由其他业务给予初始化
		 * 
		 * @param {Date} targetDate
		 */
//		oncellclick: lib.nothing,
//		oncelldblclick: lib.nothing,
//		oncellmouseover: lib.nothing,
//		oncellmouseout: lib.nothing,
//		oncellmousedown: lib.nothing,
//		oncellmouseup: lib.nothing,
//		oncellmousemove: lib.nothing,
		
		/**
		 * 当发生鼠标事件时的处理及分发
		 * @param {Event} ev
		 */
		_onmouseevent: function (ev) {
			var ev = ev || event;
			var target = ev.target || ev.srcElement;
			var type = ev.type;
			var controller = this.Controller;
			var handlerString = 'oncell' + type;
			
			if (controller[handlerString]) {
				for (var node = target; node != this; node = node.parentNode) {
					if (hasClass(node, DateCell.CLASS_DATE)) {
						var dateArr = node.id.split('_').pop().split('-');
						var targetDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
						
						controller[handlerString](targetDate);
						
						break;
					}
				}
			}
		},
		
		/**
		 * @protected
		 * 
		 * @param {String} param.wrapperId DOMID
		 * @param {}
		 * @param {Boolean} param.fixRow 是否补齐6行，默认不补齐
		 * @param {Array<String>} param.weekTitle 星期的标题文字，默认中文
		 * @param {Number} param.weekStart 星期的起始天数，0-6，默认0
		 * 
		 * 
		 * <div eui="
		 * 		id:cal-exam;
		 * 		type:baidu.eui.calendar.DateGrid;
		 * 
		 * 		year:2008;
		 * 		month:11;
		 * 		today:2009-10-19;
		 * 		
		 * 		wrapperId:xxx;
		 * 		fixRow:false;
		 * 		weekStart:0;
		 * 		weekTitle:星期天,星期一,星期二,星期三,星期四,星期五,星期六;
		 * 		//cellFormat:fn;
		 * 
		 * 		//cellType:baidu.eui.Button;
		 * "></div>
		 */
		init: function (param) {
			
			var todayPart = param.today ? param.today.split('-') : null;
			
			var p = {
				_viewDate: new Date(parseInt(param.year), parseInt(param.month) - 1, 1),
				_today: todayPart ? new Date(todayPart[0], todayPart[1] - 1, todayPart[2]) : void(0),
				_wrapperId: param.wrapperId,
				_fixRow: param.fixRow ? (param.fixRow == 'true' ? true : false) : void(0),
				_weekStart: param.weekStart ? parseInt(param.weekStart) : void(0),
				_weekTitle: param.weekTitle ? param.weekTitle.split(/\s*,\s*/) : void(0),
//				_cellFormat: param.cellFormat,
				_cellType: lib.namespace(param.cellType)
			};
			
			lib.extend(this, p);
			
			this._dateSet = new DateCellSet({
				viewDate: this._viewDate,
				wrapperId: this._wrapperId,
				cellType: this._cellType,
				today: this._today
			});
			
			this._render();
			
			var wrapper = $(this._wrapperId);
			
			wrapper.Controller = this;
			
			var mouseEvent = ['click', 'dblclick', 'mouseover', 'mouseout', 'mousedown', 'mouseup'];
			
			for (var i = mouseEvent.length - 1; i >= 0; i--) {
				var mEvent = mouseEvent[i];
				var calEvent = 'oncell' + mEvent;
				if (param[calEvent]) {
					this[calEvent] = lib.namespace(param[calEvent]);
				}
				lib.addEventListener(wrapper, mouseEvent[i], this._onmouseevent);
			}
		}
	});
	
	
	
	/**
	 * 单个日期对象
	 * @internal
	 * 
	 * @param {Object} args
	 */
	var DateCell = cal.DateCell = function () {
		this._date = null;
		this._viewDate = null;
		this._wrapperId = '';
		
		this.init.apply(this, arguments);
	};
	
	lib.extend(DateCell, {
		CLASS_DATE: 'eui-cal-date',
		CLASS_FULL_DATE_PREFIX: 'eui-cal-full-date-',
		CLASS_YEAR_PREFIX: 'eui-cal-year-',
		CLASS_MONTH_PREFIX: 'eui-cal-month-',
		CLASS_DATE_PREFIX: 'eui-cal-date-',
		
		CLASS_WORKDAY: 'eui-cal-workday',
		CLASS_WEEKEND: 'eui-cal-weekend',
		CLASS_WEEKDAY: [
			'eui-cal-sun',
			'eui-cal-mon',
			'eui-cal-tue',
			'eui-cal-wed',
			'eui-cal-thu',
			'eui-cal-fri',
			'eui-cal-sat'
		],
		
		CLASS_PAST: 'eui-cal-past',
		CLASS_TODAY: 'eui-cal-today',
		CLASS_FUTURE: 'eui-cal-future',
		
		CLASS_THIS_MONTH: 'eui-cal-this-month',
		CLASS_OTHER_MONTH: 'eui-cal-other-month',
		CLASS_LAST_MONTH: 'eui-cal-last-month',
		CLASS_NEXT_MONTH: 'eui-cal-next-month',
		
		CLASS_MARK_DISABLED: 'eui-cal-disabled',
		CLASS_MARK_SELECTED: 'eui-cal-selected',
		
		//考虑this传当前显示月的Date对象
		DayTag: {
			weekday: function (date) {
				var day = date.getDay();
				return [
					DateCell.CLASS_WEEKDAY[day],
					(day > 0 && day < 6) ? DateCell.CLASS_WORKDAY : DateCell.CLASS_WEEKEND
				].join(' ');
			},
			
//			year: function (date) {},
//			month: function (date) {},
			date: function (date, viewDate, today) {
				var year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
				var viewYear = viewDate.getFullYear(), viewMonth = viewDate.getMonth(), viewDay = viewDate.getDate();
				
				return [
					DateCell.CLASS_DATE,
					[DateCell.CLASS_FULL_DATE_PREFIX, year, '-', month + 1, '-', day].join(''),
					DateCell.CLASS_YEAR_PREFIX + year,
					DateCell.CLASS_MONTH_PREFIX + month,
					DateCell.CLASS_DATE_PREFIX + day
				].join(' ');
			},
			today: function (date, viewDate, today) {
				if (today) {
					var timeDiff = date.getTime() - today.getTime();
					return ({
						'-1': DateCell.CLASS_PAST,
						'NaN': DateCell.CLASS_TODAY,
						'1': DateCell.CLASS_FUTURE
					})[timeDiff / Math.abs(timeDiff)];
				}
			}
//			disabled: function (date) {},
//			selected: function (date) {}
		}
	});
	
	lib.extend(DateCell.prototype, {
		/**
		 * 生成并获取单元格DOM的id
		 * @private
		 * 
		 * @return {String}
		 */
		_getCellId: function () {
			return [
				this._wrapperId,
				'_',
				this._date.getFullYear(),
				'-',
				this._date.getMonth() + 1,
				'-',
				this._date.getDate()
			].join('');
		},
		
		/**
		 * DateGrid后获取单元格的DOM元素
		 * @private
		 * 
		 * @return {Element}
		 */
		_getCell: function () {
			return lib.G(this._getCellId());
		},
		
		/**
		 * 获取当前单元格的时间对象
		 */
		getDate: function () {
			return this._date;
		},
		
		/**
		 * 
		 * @param {Object} tag
		 */
		addClass: function (tag) {
			return lib.addClass(this._getCell(), tag);
		},
		
		removeClass: function (tag) {
			return lib.removeClass(this._getCell(), tag);
		},
		
		/**
		 * 设置单元格样式的接口
		 * @public
		 * 
		 * @param {Object|String} param
		 * @param {String|Null} value
		 */
		css: function (param, value) {
			return lib.css(this._getCell(), param, value);
		},
		
		/**
		 * 生成单元格内的HTML格式串
		 * @public
		 * 
		 * 在初始化后可以在外部修改
		 * 
		 * @param {Date} date
		 */
		format: function (date) {
			return date.getDate();
		},/////如果这个接口在初始化的时候没有,那么就需要更新接口后重绘日历,这是个问题...
		
		/**
		 * 生成日历单元格HTML代码
		 * @public
		 * 
		 * @param {Date} date 绘制日历的日期对象,某年某月
		 * @param {Object} option 传入的其他参数,如日期标识(已选择的,禁用的等)
		 * 
		 * @return {String}
		 */
		getHTML: function () {
			return [
				'<td id="',
				this._getCellId(),
				'" class="',
				this._renderTag(),
				'">',
				this._cellController ? this._cellController.getHTML(this._date) : this.format(this._date),
				'</td>'
			].join('');
		},
		
		_renderTag: function () {
			var prop = DateCell.DayTag;
			var tag = [];
			for (var i in prop) {
				tag.push(prop[i](this._date, this._viewDate, this._today));
			}
			return tag.join(' ');
		},
		
		/**
		 * @protected
		 * @param {String} wrapperId
		 */
		init: function (args) {
			var args = args || {};
			this._date = args.date || new Date();
			this._viewDate = args.viewDate || new Date();
			this._wrapperId = args.wrapperId;
			this._cellController = args.cellType ? new args.cellType({
				date: this._date,
				wrapperId: this._getCellId()
			}) : null;
			this._today = args.today;
		}
	});
	
	
	
	/**
	 * 日期对象集合
	 * @internal
	 * 
	 * @param {Object} args
	 */
	var DateCellSet = cal.DateCellSet = function () {
		this._dateSet = null;
		this._viewDate = null;
		this._wrapperId = '';
		
		this.reset.apply(this, arguments);
	};
	
	lib.extend(DateCellSet.prototype, {
		/**
		 * @private
		 * 
		 * @param {Date} date
		 */
		_dateId: function (date) {
			return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
		},
		
		/**
		 * @protected
		 * 
		 * @param {Date} date
		 */
		addDate: function (date) {
			var dateKey = this._dateId(date);
			if (!this._dateSet[dateKey]) {
				this._dateSet[dateKey] = new DateCell({
					date: new Date(date),
					viewDate: this._viewDate,
					wrapperId: this._wrapperId,
					cellType: this._cellType,
					today: this._today
				});
			}
			return this._dateSet[dateKey];
		},
		
		/**
		 * @protected
		 * 
		 * @param {Date} date
		 * 
		 * @return {DateCell}
		 */
		getDateCell: function (date) {
			return this._dateSet[this._dateId(date)];
		},
		
		/**
		 * @public
		 * 
		 * @param {Date} args.viewDate
		 */
		reset: function (args) {
			var args = args || {};
			
			this._dateSet = {};
			
			this._viewDate = args.viewDate || this._viewDate;
			this._wrapperId = args.wrapperId || this._wrapperId;
			this._cellType = args.cellType || this._cellType;
			this._today = args.today || this._today;
		}
	});
})();