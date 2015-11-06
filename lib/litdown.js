;(function () {
var encodings = [
	['&',  'amp'],
	['<',  'lt'],
	['>',  'gt'],
	['"',  'quot'],
];

function encode (html) {
	for (var i = 0; i < encodings.length; i++) {
		var re = new RegExp(encodings[i][0], 'g');
		html = html.replace(re, '&' + encodings[i][1] + ';');
	}
	return html;
}

function merge (obj) {
	var target;
	var key;
	for (var i = 1; i < arguments.length; i++) {
		target = arguments[i];
		for (key in target) {
			if (Object.prototype.hasOwnProperty.call(target, key)) {
				obj[key] = target[key];
			}
		}
	}
	return obj;
}

function normalize (s) {
	return s.toLowerCase().replace(/[^\w+]/g, '-');
}

function flow (text, width, indent) {
	if (! width) width = process.stdout.columns - 1 || 80;
	if (! indent) indent = '';
	var r = indent;
	var len = r.length;
	if (text instanceof Array) text = text.join(' ');
	if (text.match(/^\* /)) indent += '  ';
	text.split(' ').forEach(function (word) {
		if ( (len + word.length + 1) < width) {
			r += word + ' ';
			len += word.length + 1;
		} else {
			r += '\n' + indent + word + ' ';
			len = indent.length + word.length + 1;
		}
	});
	r += '\n';
	return r;
}

function canary () {
	return Math.floor(Math.random() * Math.pow(2, 50)).toString(36);
}

function header_state (level, text, toc, state) {
	var t = normalize(text);
	if (state.blocks.contents[t] == null) {
		state.blocks.contents[t] = '';
		state.blocks.order.push(t);
	}
	if (level <= toc.maxlevel) {
		for (var i = 1; i < level; i++) state.toc.md += '    ';
		state.toc.md += '* [' + text + '](#' + t + ')\n';
	}
	return state;
}

function header_html (level, text, toc) {
	var t = normalize(text);
	var r = '<a name="' + t + '">' + text + '</a>';
	if (toc)
		r += ' <a href="#' + normalize(toc.header) + '">' + toc.top + '</a>';
	r = '<h' + level + '>' + r + '</h' + level + '>\n';
	return r;
}

function link_state (text, href, title, state) {
	if (href && href.match(/^#/)) {
		href = href.replace(/^#/, '');
		if (title && title.match(/^save:/)) {
			if (state.files.contents[href] == null) {
				state.files.contents[href] = '';
				state.files.mode[href] = title.replace(/^save:/, '');
				state.files.order.push(href);
			}
		}
	}
	return state;
}

function link_html (text, href, title) {
	if (href && href.match(/^#/))
		href = '#' + normalize(href.replace(/^#/, ''));
	var r = '<a href="' + href + '"';
	if (title) r += ' title="' + title + '"';
	r += '>' + text + '</a>';
	return r;
}

function code_state (code, state) {
	var t = state.blocks.order[state.blocks.order.length - 1];
	if (! state.blocks.contents[t])
		state.blocks.contents[t] = code;
	return state;
}

function code_html (code, lang, prefix) {
	code = code.replace(/\n+$/, '');
	var r = '<pre><code';
	if (lang && prefix) r += ' class="' + prefix + lang + '"';
	r += '>' + encode(code) + '\n</code></pre>\n';
	return r;
}
function cli (argv) {

var fs = require('fs');
var path = require('path');
function find (d) {
	var r = { files: [], dirs: [], stat: {} };
	var f = fs.readdirSync(d);
	for (var i = 0; i < f.length; i++) {
		if (! f[i].match(/^\./)) {
			var n = path.join(d, f[i]);
			var s = fs.statSync(n);
			if (s.isDirectory()) {
				r.dirs.push(n);
				var t = find(n);
				for (var j = 0; j < t.files.length; j++) {
					r.stat[t.files[j]] = t.stat[t.files[j]];
					r.files.push(t.files[j]);
                }
                for (var j = 0; j < t.dirs.length; j++) {
                    r.dirs.push(t.dirs[j]);
				}
			} else {
				r.stat[n] = s;
				r.files.push(n);
			}
		}
	}
	return r;
}

function mkpath (d, f) {
	d = path.resolve(d);
	f = f || function () {};
	fs.mkdir(d, function (e) {
		if (e) {
			if (e.code === 'ENOENT') {
				mkpath(path.dirname(d),
					function (e) { e ? f(e) : mkpath(d, f) });
			} else if (e.code === 'EEXIST') {
				f(null);
			} else {
				f(e);
			}
		} else {
			f(null);
		}
	});
}

function write_file(d, n, f, m) {
	var fn = path.join(n, f);
	if (! m)
		m = 0644;
	else if (m.match(/^[0-7]{3}$/))
		m = eval('0' + m)
	else
		throw new Error('Invalid file mode "' + m + '"!' +
			' Must be three octal digits.');
	mkpath(path.dirname(fn), function (e) {
		if (e) throw e;
		fs.writeFile(fn, d, { mode: m }, function (e) {
			v('  ' + fn);
			if (e) throw e;
		});
	});
}

function exists (f) {
	try {
		fs.writeFileSync(f, '', { flag: 'wx' });
	} catch (e) {
		return e && e.code === 'EEXIST' ? true : false;
	}
}

function B () {
	console.log('Backends\n' +
		'  Supported: ' + cfg.backend.supported.join(', ') + '\n' +
		'  Installed: ' + cfg.backend.installed.join(', ') + '\n' +
		'  Preferred: ' + cfg.backend.preferred.join(', ') + '\n' +
		'  Selected:  ' + cfg.backend.selected);
}

function S () {
	console.log('Syntax highlighters\n' +
		'  Supported: ' + cfg.highlight.supported.join(', ') + '\n' +
		'  Preferred: ' + cfg.highlight.preferred.join(', ') + '\n' +
		'  Selected:  ' + cfg.highlight.selected);
}

function rmext (f) { return f.replace(/\.js$/, '') }

function v_ (s, v, n) { if (v >= n) console.log(s) }

function v (s) { v_(s, cfg.verbose, 1) }

function vv (s) { v_(s, cfg.verbose, 2) }
var cfg = {
	verbose: 1,
	encoding: 'utf8',
	backend: {
		plugins: path.join(__dirname, 'backend'),
		preferred: ['commonmark', 'marked', 'markdown-it'],
	},
	highlight: {
		plugins: path.join(__dirname, 'highlight'),
		preferred: ['highlightjs-cdn', 'none'],
	},
	json: false,
	mode: 'extract',
};
cfg.backend.supported = fs.readdirSync(cfg.backend.plugins).map(rmext);
if (cfg.backend.supported.length < 1)
	throw new Error('No backend plugins!');
cfg.backend.installed = cfg.backend.supported.filter(function (n) {
	var f;
	try { f = require.resolve(n) } catch (e) {}
	return f;
});
for (var i = 0; i < cfg.backend.preferred.length; i++) {
	var n = cfg.backend.preferred[i];
	if (cfg.backend.installed.indexOf(n) >= 0) {
		cfg.backend.selected = n;
		i = cfg.backend.preferred.length;
	}
}
cfg.highlight.supported = fs.readdirSync(cfg.highlight.plugins).map(rmext);
if (cfg.highlight.supported.length < 1)
	throw new Error('No highlight plugins!');
cfg.highlight.selected = cfg.highlight.preferred[0];
var usage = '\n' +
'# Usage\n\n```\n' +
'litdown -x [options] file\n' +
'litdown -c [options] directory\n' +
'```\n\n# Options\n\n```\n' +
'-h, --help   Show usage\n' +
'-v           Increase verbosity\n' +
'-q           Disable output\n' +
'```\n\n## Mode options\n\n```\n' +
'-x   Extract a Markdown file to a directory (default)\n' +
'-c   Create a Markdown file from files in directory\n' +
'```\n\n## Extract options\n\n```\n' +
'-l               Save internal state to "litdown.json"\n' +
'-b name[,name]   Preferred backend(s) (default: ' +
	cfg.backend.preferred.join(',') + ')\n' +
'-B               Show backend selection (use after -b to check)\n' +
'-s name[,name]   Preferred syntax highlighter (default: ' +
	cfg.highlight.preferred.join(',') + ')\n' +
'-S               Show syntax highlighter selection (use after -s to check)\n' +
'```\n';
var args = [];
for (var i = 0; i < argv.length; i++) {

var s = argv[i];

// Universal options

// -h, --help
if (s == '-h' || s == '--help') {
	console.log(usage);
	process.exit(0);

// -v
} else if (s == '-v') {
	cfg.verbose++;

// -q
} else if (s == '-q') {
	cfg.verbose = 0;

// Mode options

// -x
} else if (s == '-x') {
	cfg.mode = 'extract';

// -c
} else if (s == '-c') {
	cfg.mode = 'create';

// Extract options

// -l
} else if (s == '-l') {
	cfg.json = true;

// -b
} else if (s == '-b') {
	var a = argv[i + 1];
	if (! a) a = '';
	a = a.split(/,/);
	var b = [];
	for (var j = 0; j < a.length; j++) {
		var n = a[j];
		if (! n || n == '') {
			B();
			return 0;
		} else if (cfg.backend.supported.indexOf(n) < 0) {
			console.log('ERROR: The "' + n + '" backend is not ' +
				'supported.');
			process.exit(1);
		} else if (cfg.backend.installed.indexOf(n) < 0) {
			console.log('ERROR: The "' + n + '" backend is not ' +
				'installed. ' +
				'Install it via `npm install -g ' + n + '`.');
			process.exit(1);
		} else {
			b.push(n);
		}
	}
	cfg.backend.preferred = b.slice(0);
	cfg.backend.selected = cfg.backend.preferred[0];
	i++;

// -B
} else if (s == '-B') {
	B();
	return 0;

// -s
} else if (s == '-s') {
	var a = argv[i + 1];
	if (! a) a = '';
	a = a.split(/,/);
	var b = [];
	for (var j = 0; j < a.length; j++) {
		var n = a[j];
		if (! n || n == '') {
			S();
			return 0;
		} else if (cfg.highlight.supported.indexOf(n) < 0) {
			console.log('ERROR: The "' + n + '" syntax highlighter is ' +
				'not supported.');
			process.exit(1);
		} else {
			b.push(n);
		}
	}
	cfg.highlight.preferred = b.slice(0);
	cfg.highlight.selected = cfg.highlight.preferred[0];
	i++;

// -S
} else if (s == '-S') {
	S();
	return 0;

// Argument
} else {
	args.push(s);
}

}

vv('cfg = ' + JSON.stringify(cfg, null, '\t'));
if (args.length < 1) {
	console.log(usage);
	return 1;
}
if (cfg.backend.installed.length < 1) {
	console.log('ERROR: No backend modules installed! ' +
		'Please install one or more of: ' +
		cfg.backend.supported.join(', ') + '.\n' + usage);
	process.exit(1);
}
if (cfg.mode == 'extract') {

var f = args[0];
v(f);
var n = path.basename(f, '.md');
fs.readFile(f, { encoding: cfg.encoding }, function (e, input) {
	if (e) {
		if (e.code == 'EISDIR') {
			console.log('ERROR: "' + f + '" is a directory! ' +
				'Perhaps you meant to use -c?');
			process.exit(1);
		}
		throw e;
	}
	var backend = path.join(cfg.backend.plugins, cfg.backend.selected);
	backend = require(backend);
	var highlight = path.join(cfg.highlight.plugins, cfg.highlight.selected);
	highlight = require(highlight);
	var state = litdown(input, { backend: backend, highlight: highlight });
	state.cfg = cfg;
	fs.mkdir(n, function (e) {
		if (e) {
			if (e.code == 'EEXIST') {
				console.log('ERROR: Directory "' + n + '" exists!\n');
				process.exit(1);
			}
			throw e;
		}
		if (cfg.json)
			write_file(JSON.stringify(state, null, '\t') + '\n',
				n, 'litdown.json');
		write_file(input, n, n + '.md');
		write_file(state.html, n, n + '.html');
		write_file(state.readme, n, 'README.md');
		state.files.order.forEach(function (f) {
			write_file(state.files.contents[f], n, f,
				state.files.mode[f]);
		});
	});
});

return 0;

}
if (cfg.mode == 'create') {

var d = args[0];
var f = path.basename(d) + '.md';
v(f);
if (exists(f)) {
	console.log('ERROR: File "' + f + '" exists!');
	process.exit(1);
}
var list = find(d);
var files = list.files;
var output = "# Files\n\n";
var re = new RegExp('^' + d + '/');
for (var i = 0; i < files.length; i++) {
	var fn = files[i].replace(re, '');
	var mode = (list.stat[files[i]].mode - 32768).toString(8);
	if (mode == '644') mode = '';
	output += '* [' + fn + '](#' + fn + ' "save:' + mode + '")\n';
}
for (var i = 0; i < files.length; i++) {
	var fn = files[i].replace(re, '');
	output += '\n## ' + fn + '\n\n```\n';
	var d = fs.readFileSync(files[i], { encoding: 'utf8' });
	d = d.replace(/```/g, '_' + '"_backticks"');
	output += d;
	output = output.replace(/\n$/, '') + "\n```\n";
	v('  ' + files[i]);
}
output += '\n';
fs.writeFileSync(f, output);

return 0;

}

throw new Error('Invalid mode "' + cfg.mode + '"!');
}
function litdown (src, opt) {

try {

opt = opt ? merge({}, litdown.defaults, opt) : litdown.defaults;

this.state = {
	readme: src,
	toc: { md: '# ' + opt.toc.header + '\n\n' },
	blocks: { contents: {
		'_backticks': '```',
		'_tab': '\t',
	}, order: [] },
	files: { contents: {}, order: [], mode: {} },
};

var backend = opt.backend;

// backend parse
this.state = backend.parse(src, this.state, opt);

// prepend the toc to the readme
this.state.toc.md += '\n';
this.state.readme = this.state.toc.md + this.state.readme;

// resolve files
this.state.files.order.forEach(function (s) {
	var t = normalize(s);
	var c = this.state.blocks.contents[t] || '';
	var w = c;

	// replace template labels
	var re = new RegExp('_' + '"([^"]+)"');
	var m;
	var n = canary();
	while ( (m = re.exec(c) ) !== null) {
		var l = normalize(m[1]);
		if (l == t) {
			throw new Error('Circular template label "' + l + '" detected in "'
			+ s + '" file at index "' + m.index + '"');
		}
		w = this.state.blocks.contents[l];
		if (! w) w = '_' + n + m[1] + n;
		c = c.replace(re, w);
	}
	c = c.replace(new RegExp(n, 'g'), '"');

	this.state.files.contents[s] = c + '\n';
});

// backend render
this.state = backend.render(this.state, opt);
this.state.html = this.state.html
	.replace(/_&quot;_tab&quot;/g, '\t')
	.replace(/_&quot;_backticks&quot;/g, '```')
	.replace(new RegExp('<code class="' + opt.lang_prefix +
		'nohighlight">', 'g'), '<code class="nohighlight">');
this.state.html = this.state.toc.html + this.state.html;
this.state.html = opt.html.header + this.state.html + opt.html.footer;

// highlight
this.state.html = opt.highlight(this.state.html);

delete this.state.f;
var r = this.state;
this.state = {};
r.opt = opt;
return r;

} catch (e) {

if (e.code == 'MODULE_NOT_FOUND') {
	var m = /'([^']*)'/.exec(e.message);
	e.message += '. Install it via `npm install -g ' + m[1] + '`.\n';
}

if (opt.silent) {
	return '<p>ERROR:</p><pre>' + encode(e.message, true) + '</pre>';
}

throw e;

}

}
litdown.options = litdown.setOptions = function (opt) {
	merge (litdown.defaults, opt);
	return litdown;
};

litdown.defaults = {
	silent: false,
	toc: { maxlevel: 2, header: 'Contents', top: '^' },
	html: {
		header: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n' +
			'\tcode{\n' +
			'\t\tbackground-color: #f0f0f0;\n' +
			'\t\tpadding: 0px 2px;\n' +
			'\t\tborder: 1px solid #c0c0c0;\n' +
			'\t}\n' +
			'\tpre code{\n' +
			'\t\tdisplay: block;\n' +
			'\t}\n' +
			'\tpre{\n' +
			'\t\ttab-size: 4;\n' +
			'\t\twhite-space: pre-wrap;\n' +
			'\t}\n' +
			'\ta{\n' +
			'\t\ttext-decoration: none;\n' +
			'\t}\n' +
			'</style>\n</head>\n<body>\n',
		footer: '\t</body>\n</html>\n',
	},
	lang_prefix: 'lang-',
	f: {
		normalize: normalize,
		encode: encode,
		canary: canary,
		header_state: header_state,
		header_html: header_html,
		link_state: link_state,
		link_html: link_html,
		code_state: code_state,
		code_html: code_html,
	},
};
litdown.state = {};
litdown.cli = cli;

if (typeof module !== 'undefined' && typeof exports === 'object') {
	module.exports = litdown;
} else if (typeof define === 'function' && define.amd) {
	define(function() { return litdown; });
} else {
	this.litdown = litdown;
}

}).call(function () {
	return this || (typeof window !== 'undefined' ? window : global);
}());
