'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getMatchedParams = getMatchedParams;
exports.getQueryParams = getQueryParams;
exports.createRoute = createRoute;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var parametersPattern = /(:[^\/]+)/g;

// Some utility functions. Exported just to be able to test them easily

function getMatchedParams(route, path) {
	var matches = path.match(route.matcher);

	if (!matches) {
		return false;
	}

	return route.params.reduce(function (acc, param, idx) {
		acc[param] = decodeURIComponent(matches[idx + 1]);
		return acc;
	}, {});
};

function getQueryParams(query) {
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

function createRoute(name, path, handler) {
	var matcher = new RegExp(path.replace(parametersPattern, '([^\/]+)') + '$');
	var params = (path.match(parametersPattern) || []).map(function (x) {
		return x.substring(1);
	});

	return { name: name, path: path, handler: handler, matcher: matcher, params: params };
};

var findRouteParams = function findRouteParams(routes, path) {
	var params = void 0;
	var route = routes.find(function (r) {
		return params = getMatchedParams(r, path);
	});
	return { route: route, params: params };
};

var parseUrl = function parseUrl(url) {
	var _url$split = url.split('?');

	var _url$split2 = _slicedToArray(_url$split, 2);

	var path = _url$split2[0];
	var queryString = _url$split2[1];

	return { path: path, queryString: queryString };
};

var stripPrefix = function stripPrefix(url, prefix) {
	return url.replace(new RegExp('^' + prefix), '');
};

// The actual Router as the default export of the module

var Router = function () {
	function Router() {
		_classCallCheck(this, Router);

		this.routes = [];
		this.prefix = '';
	}

	// Adds a route with an _optional_ name, a path and a handler function


	_createClass(Router, [{
		key: 'add',
		value: function add(name, path, handler) {
			if (arguments.length == 2) {
				this.add.apply(this, [''].concat(Array.prototype.slice.call(arguments)));
			} else {
				this.routes.push(createRoute(name, path, handler));
			}
			return this;
		}
	}, {
		key: 'setPrefix',
		value: function setPrefix(prefix) {
			this.prefix = prefix;
			return this;
		}
	}, {
		key: 'dispatch',
		value: function dispatch(url) {
			var _parseUrl = parseUrl(stripPrefix(url, this.prefix));

			var path = _parseUrl.path;
			var queryString = _parseUrl.queryString;

			var query = getQueryParams(queryString || '');

			var _findRouteParams = findRouteParams(this.routes, path);

			var route = _findRouteParams.route;
			var params = _findRouteParams.params;


			if (route) {
				route.handler({ params: params, query: query });
				return route;
			}

			return false;
		}
	}, {
		key: 'getCurrentRoute',
		value: function getCurrentRoute(url) {
			var _parseUrl2 = parseUrl(stripPrefix(url, this.prefix));

			var path = _parseUrl2.path;
			var queryString = _parseUrl2.queryString;

			var rp = findRouteParams(this.routes, path);
			return rp && rp.route;
		}
	}, {
		key: 'formatUrl',
		value: function formatUrl(routeName) {
			var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			var query = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var route = this.routes.find(function (r) {
				return r.name === routeName;
			});

			if (!route) {
				return '';
			}

			var queryString = Object.keys(query).map(function (k) {
				return [k, query[k]];
			}).map(function (_ref) {
				var _ref2 = _slicedToArray(_ref, 2);

				var k = _ref2[0];
				var v = _ref2[1];
				return encodeURIComponent(k) + '=' + encodeURIComponent(v);
			}).join('&');

			var path = this.prefix + route.path.replace(parametersPattern, function (match) {
				return params[match.substring(1)];
			});

			return queryString.length ? path + '?' + queryString : path;
		}
	}]);

	return Router;
}();

exports.default = Router;
;