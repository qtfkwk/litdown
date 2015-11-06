;(function () {
var commonmark = require('commonmark');
var parser = new commonmark.Parser();
var renderer = new commonmark.HtmlRenderer();
function parse (src, state, opt) {

src = src.replace(/\t/g, '_' + '"_tab"');

state.ast = parser.parse(src);

// traverse abstract syntax tree
var walker = state.ast.walker();
var e;
var n;
state.anchor = {};
while ((e = walker.next())) {
	if (e.entering) {
		n = e.node;

		// Header
		if (n.type === 'Header') {
			var text = n.firstChild.literal;
			var level = n.level;
			state = opt.f.header_state(level, text, opt.toc, state);
			var t = opt.f.normalize(text);
			if (! state.anchor[t]) state.anchor[t] = text;
			n.firstChild.literal = '_' + '"_anchor:' + t + '"';

		// Link
		} else if (n.type === 'Link') {
			var title = n.title;
			var href = n.destination;
			state = opt.f.link_state(text, href, title, state);
			if (href.match(/^#/))
				n.destination = '#' + opt.f.normalize(href.replace(/^#/, ''));

		// Code
		} else if (n.type === 'CodeBlock') {
			var code = n.literal.replace(/\n+$/, '');
			//var lang = n.info;
			state = opt.f.code_state(code, state);
		}
	}
}

return state;

}
function render (state, opt) {

// use header_html?

var h = opt.toc.header;
var top = opt.f.normalize(h);
state.toc.html = renderer.render(parser.parse(state.toc.md))
	.replace(new RegExp('<h1>' + h + '</h1>'),
		'<h1><a name="' + top + '">' + h + '</a></h1>');

var html = renderer.render(state.ast);

delete state.ast; // causes error when dumping state via -l to litdown.json

// resolve anchors
var re = new RegExp('_&quot;_anchor:([a-z0-9\-]+)&quot;');
var m;
while ( (m = re.exec(html) ) !== null) {
	var t = m[1];
	var text = state.anchor[t];
	var r = new RegExp('_&quot;_anchor:' + t + '&quot;', 'g');
	html = html.replace(r,
		'<a name="' + t + '">' + text + '</a> ' +
		'<a href="#' + top + '">' + opt.toc.top + '</a>');
}

// replace lang prefix
re = new RegExp('<code class="language-([^"]+)">');
while ( (m = re.exec(html) ) !== null) {
	html = html.replace(re, '<code class="' + opt.lang_prefix + m[1] + '">');
}

state.html = html;

return state;

}
var backend = { parse: parse, render: render };

if (typeof module !== 'undefined' && typeof exports === 'object') {
	module.exports = backend;
} else if (typeof define === 'function' && define.amd) {
	define(function() { return backend; });
} else {
	this.backend = backend;
}

}).call(function () {
	return this || (typeof window !== 'undefined' ? window : global);
}());
