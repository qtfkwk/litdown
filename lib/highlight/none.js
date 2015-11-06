;(function () {
function highlight (html) { return html }
if (typeof module !== 'undefined' && typeof exports === 'object') {
	module.exports = highlight;
} else if (typeof define === 'function' && define.amd) {
	define(function() { return highlight; });
} else {
	this.highlight = highlight;
}

}).call(function () {
	return this || (typeof window !== 'undefined' ? window : global);
}());
