
/*
	Halo API.
*/

var osc = require('node-osc');

var Halo = function () {
	return this;
};

Halo.prototype.connect = function(ip, port) {
	var _ip = ip || '127.0.0.1';
	var _port = port || 1314;

	this.client = new osc.Client(_ip, _port);

	return this;
};

/*
	Control a halo module.

	@param {Integer} x
	@param {Integer} y
	@param {Color} color
	@param {Float} time
*/

Halo.prototype.controlHalo = function (x, y, color, time) {
	this.client.send('/halo', x, y, color.r, color.g, color.b, time);
};


/*
	Control an individual LED 

	@param {Integer} x
	@param {Integer} y
	@param {Integer} ledIndex
	@param {Color} color
	@param {Float} time
*/

Halo.prototype.controlLED = function (x, y, ledIndex, color, time) {
	this.client.send('/led', x, y, ledIndex, color.r, color.g, color.b, time);
};


/*
	Control a row of halos.
	
	@param {Integer} rowIndex
	@param {Color} color
	@param {Float} time
*/

Halo.prototype.controlRow = function (rowIndex, color, time) {
	this.client.send('/row', rowIndex, color.r, color.g, color.b, time);
};


/*
	Control a column of halos.

	@param {Integer} colIndex
	@param {Color} color
	@param {Float} time
*/

Halo.prototype.controlColumn = function (colIndex, color, time) {
	this.client.send('/column', colIndex, color.r, color.g, color.b, time);
};

/*
	Control a circular area of halos.

	@param {Integer} x
	@param {Integer} y
	@param {Float} radius
	@param {Color} color
	@param {Float} time
*/

Halo.prototype.controlArea = function (x, y, radius, color, time) {
	this.client.send('/area', x, y, radius, color.r, color.g, color.b, time);
};

module.exports = new Halo();