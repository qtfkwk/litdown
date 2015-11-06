;(function () {
var marked = require('marked');
function parse (src, state, opt) {

var renderer = new marked.Renderer();

// Header
renderer.heading = function (text, level) {
	state = opt.f.header_state(level, text, opt.toc, state);
	return opt.f.header_html(level, text, opt.toc);
};

// Link
renderer.link = function (href, title, text) {
	state = opt.f.link_state(text, href, title, state);
	return opt.f.link_html(text, href, title);
};

// Code
renderer.code = function (code, lang) {
	state = opt.f.code_state(code, state);
	return opt.f.code_html(code, lang, opt.lang_prefix);
};

src = src.replace(/\t/g, '_' + '"_tab"');

state.html = marked(src, { renderer: renderer })
	.replace(/><ul>/g, '>\n<ul>')
	.replace(/&#39;/g, "'");

return state;

}
function render (state, opt) {

var renderer = new marked.Renderer();

renderer.heading = function (text, level) {
	return opt.f.header_html(level, text);
};

state.toc.html = marked(state.toc.md, { renderer: renderer })
	.replace(/><ul>/g, '>\n<ul>');

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
