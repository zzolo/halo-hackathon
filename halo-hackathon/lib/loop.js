
module.exports = function (callback, speed) {
	var start = Date.now();
	var time  = 0;
	var count = 0;
	var diff  = 0;
	var tick = function () {
		setTimeout( function () {
			count++;
			time = Date.now() - start;
			diff = time - count * speed;
			callback(time);
			tick();
		}, speed - diff);
	};
	tick();
};