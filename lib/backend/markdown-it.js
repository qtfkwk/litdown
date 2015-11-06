;(function () {
var md = require('markdown-it')();
function parse (src, state, opt) {

var heading = '';
var link = '';

var def = {
	text: md.renderer.rules.text,
};

md.renderer.rules.text = function (tokens, idx, options, env, self) {
	var text = tokens[idx].content;

	// Header
	if (heading != '') {
		var level = heading.replace(/^h/, '');
		heading = '';
		state = opt.f.header_state(level, text, opt.toc, state);
		return opt.f.header_html(level, text, opt.toc);
	
	// Link
	} else if (link != '') {
		var href = link.href;
		var title = link.title;
		link = '';
		state = opt.f.link_state(text, href, title, state);
		return opt.f.link_html(text, href, title);
	}

	return def.text(tokens, idx, options, env, self);
};

// Header
md.renderer.rules.heading_open = function (tokens, idx) {
	heading = tokens[idx].tag;
	return '';
};
md.renderer.rules.heading_close = function () { return '' }

// Link
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
	var a = tokens[idx].attrs;
	link = {};
	for (var i = 0; i < a.length; i++) link[a[i][0]] = a[i][1];
	return '';
}
md.renderer.rules.link_close = function () { return '' }

// Code
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
	var code = tokens[idx].content.replace(/\n+$/, '');
	var lang = tokens[idx].info;
	state = opt.f.code_state(code, state);
	return opt.f.code_html(code, lang, opt.lang_prefix);
};

src = src.replace(/\t/g, '_' + '"_tab"');

state.html = md.render(src);

return state;

}
function render (state, opt) {

md = require('markdown-it')();

var heading = '';

var def = {
	text: md.renderer.rules.text,
};

md.renderer.rules.text = function (tokens, idx, options, env, self) {
	var text = tokens[idx].content;

	// Header
	if (heading != '') {
		var level = heading.replace(/^h/, '');
		heading = '';
		return opt.f.header_html(level, text);
	}

	return def.text(tokens, idx, options, env, self);
};

// Header
md.renderer.rules.heading_open = function (tokens, idx) {
	heading = tokens[idx].tag;
	return '';
};
md.renderer.rules.heading_close = function () { return '' }

state.toc.html = md.render(state.toc.md);

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
