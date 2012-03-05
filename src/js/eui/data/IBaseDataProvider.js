/*
 * eui JavaScript Library
 * 
 * create: 
 * @2011-09-20 by mytharcher
 * 
 * update:
 */

///import js.util.Class;
///import eui.Base;

eui.IBaseDataProvider = {
	render: (function (origin) {
		return function () {
			var me = this;
			if (!me.rendered) {
				if (me.dataProvider) {
					me.dataProvider = eui.Engine.get(me.dataProvider);
					me.dataProvider.on('dataupdate', me.updateData.bind(me));
				}
			}
			origin.call(me);
		};
	})(eui.Base.prototype.render),
	
	updateData: new Function()
};

js.util.Class.implement(eui.Base, eui.IBaseDataProvider);
