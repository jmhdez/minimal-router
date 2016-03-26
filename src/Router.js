const parametersPattern = /(:[^\/]+)/g;

// Some utility functions. Exported just to be able to test them easily

export function getMatchedParams(route, path) {
	const matches = path.match(route.matcher);

	if (!matches) {
		return false;
	}

	return route.params.reduce((acc, param, idx) => {
		acc[param] = decodeURIComponent(matches[idx + 1]);
		return acc;
	}, {});
};

export function getQueryParams(query) {
	return query.split('&')
		.filter(p => p.length)
		.reduce((acc, part) => {
			const [key, value] = part.split('=');
			acc[decodeURIComponent(key)] = decodeURIComponent(value);
			return acc;
		}, {});	
};

export function createRoute(name, path, handler) {
	const matcher = new RegExp(path.replace(parametersPattern, '([^\/]+)'));
	const params = (path.match(parametersPattern) || []).map(x => x.substring(1));
	
	return {name, path, handler, matcher, params};
};

function findRouteParams(routes, path) {
	let params;
	const route = routes.find(r => params = getMatchedParams(r, path));
	return route && {route, params};
}

function parseUrl(url) {
	const [path, queryString] = url.split('?');
	return {path, queryString};
}

// The actual Router as the default export of the module
export default class Router {
	constructor() {
		this.routes = [];
		this.prefix = '';
	}

	// Adds a route with an _optional_ name, a path and a handler function
	add(name, path, handler) {
		if (arguments.length == 2) {
			this.add('', ...arguments);
		} else {
			this.routes.push(createRoute(name, path, handler));
		}
		return this;
	}

	setPrefix(prefix) {
		this.prefix = prefix;
		return this;
	}

	dispatch(url) {
		const urlWithoutPrefix = url.replace(new RegExp('^' + this.prefix), '');
		const {path, queryString} = parseUrl(urlWithoutPrefix);
		const query = getQueryParams(queryString || '');
		const {route, params} = findRouteParams(this.routes, path);
		
		if (route) {
			route.handler({params, query});
			return route;
		}

		return false;
	}

	getCurrentRoute(url) {
		const urlWithoutPrefix = url.replace(new RegExp('^' + this.prefix), '');
		const {path, queryString} = parseUrl(urlWithoutPrefix);
		const rp = findRouteParams(this.routes, path);
		return rp && rp.route;
	}

	formatUrl(routeName, params = {}, query = {}) {
		const route = this.routes.find(r => r.name === routeName);

		if (!route) {
			return '';
		}

		const queryString = Object.keys(query)
				  .map(k => [k, query[k]])
				  .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
				  .join('&');

		const path = this.prefix + route.path.replace(parametersPattern, function(match) {
			return params[match.substring(1)];
		});

		return queryString.length ? path + '?' + queryString : path;
	}
};
