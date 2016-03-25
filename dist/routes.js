(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.buildMatcher = buildMatcher;
exports.extractParams = extractParams;
exports.isMatch = isMatch;
exports.extractQueryParams = extractQueryParams;
exports.default = Router;
var extractParamsRegExp = /(:[^\/]+)/g;
var buildMatcherRegExp = /:[^\/]+/g;

function buildMatcher(path) {
	return new RegExp(path.replace(buildMatcherRegExp, '([^\/]+)'));
};

function extractParams(path) {
	return (path.match(extractParamsRegExp) || []).map(function (x) {
		return x.substring(1);
	});
};

function isMatch(route, path) {
	var matches = path.match(route.matcher);

	if (!matches) {
		return false;
	}

	return route.params.reduce(function (acc, p, idx) {
		acc[p] = decodeURIComponent(matches[idx + 1]);
		return acc;
	}, {});
};

function extractQueryParams(query) {
	return query.split('&').filter(function (p) {
		return p.length;
	}).reduce(function (acc, part) {
		var _part$split = part.split('=');

		var _part$split2 = _slicedToArray(_part$split, 2);

		var key = _part$split2[0];
		var value = _part$split2[1];

		acc[decodeURIComponent(key)] = decodeURIComponent(value);
		return acc;
	}, {});
};

function Router() {
	this.routes = [];
};

Router.prototype.add = function (path, handler) {
	this.routes.push({
		path: path,
		handler: handler,
		matcher: buildMatcher(path),
		params: extractParams(path)
	});
};

Router.prototype.dispatch = function (url) {

	var separator = url.lastIndexOf('?'),
	    path = separator >= 0 ? url.substring(0, separator) : url,
	    queryString = separator >= 0 ? url.substring(separator + 1) : '',
	    query = extractQueryParams(queryString);

	for (var i = 0; i < this.routes.length; i++) {
		var params = isMatch(this.routes[i], path);
		if (params) {
			this.routes[i].handler({ params: params, query: query });
			return true;
		}
	}

	return false;
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Router = require('./Router');

var _Router2 = _interopRequireDefault(_Router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Router2.default;

},{"./Router":1}]},{},[2]);
