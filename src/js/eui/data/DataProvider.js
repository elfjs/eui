///import js.util.Class;

eui.base.DataProvider = js.util.Class.create({
	/**
	 * @cfg {String} url
	 */
	constructor: function (args) {
		js.util.Class.copy(args, this);
		
		this._data = {};
	},
	
	get: function (key) {
		var ret = this._data[key];
		return js.util.Type.isDefined(ret) ? ret : null;
	},
	
	set: function (data) {
		
	},
	
	query: function (param) {
		
	}
});


