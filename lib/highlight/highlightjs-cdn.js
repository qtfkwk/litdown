;(function () {
function highlight (html) {

var p = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/';
var css = p + 'styles/default.min.css';
var js = p + 'highlight.min.js';

return html.replace('</head>',
	'<link rel="stylesheet" href="' + css + '">\n' +
	'<script src="' + js + '"></script>\n' +
	'<script>hljs.initHighlightingOnLoad();</script>\n' +
	'</head>');

}
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
