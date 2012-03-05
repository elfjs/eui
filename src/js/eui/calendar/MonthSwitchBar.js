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
	
	var MonthSwitchBar = cal.MonthSwitchBar = function () {
		
	};
	
	lib.extend(MonthSwitchBar, {
		MONTH_TITLE: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		
		CLASS_WRAPPER: 'eui-cal-month-switch',
		CLASS_BAR: 'eui-cal-month-switch-bar',
		CLASS_MONTH: 'eui-cal-month-switch-month',
		CLASS_BUTTON: 'eui-cal-month-switch-button',
		CLASS_MONTH_CURRENT: 'eui-cal-month-switch-month-current',
		CLASS_MONTH_PREVIEW: 'eui-cal-month-switch-month-preview',
		CLASS_MONTH_NEXT: 'eui-cal-month-switch-month-next',
		CLASS_BUTTON_PREVIEW: 'eui-cal-month-switch-preview',
		CLASS_BUTTON_NEXT: 'eui-cal-month-switch-next'
	});
	
	lib.extend(MonthSwitchBar.prototype, {
		getViewDate: function () {
			return this._viewDate;
		},
		
		getMonth: function () {
			return this._viewDate.getMonth() + 1;
		},
		
		_setMonth: function (month) {
			this._viewDate.setMonth(month - 1);
		},
		
		changeMonth: function (month) {
			this._setMonth(month);
		},
		
		jumpMonth: function (offsetMonth) {
			this.changeMonth(this.getMonth() + offsetMonth);
		},
		
		_render: function () {
			var html = [];
			
		},
		
		/**
		 * @protected
		 * 
		 * @param {String} param.wrapperId DOMID
		 * @param {Array<String>} param.weekTitle 月份的标题文字，默认中文
		 * 
		 * <div eui="
		 * 		year:2009;
		 * 		month:11;
		 * 		
		 * 		wrapperId:xxx;
		 * 		switchNum:5;
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
				_weekTitle: param.weekTitle,
//				_cellFormat: param.cellFormat,
				_cellType: lib.namespace(param.cellType)
			};
			
			lib.extend(this, p);
			
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
})();