import 'babel-polyfill';

import assert from 'assert';

import {createRoute, getQueryParams, getMatchedParams} from '../src/Router.js';

describe('Route creation', function() {

	var noop = function() {};

	var buildMatcher = function(path) {
		return createRoute('', path, noop).matcher;
	};

	var getParamNames = function(path) {
		return createRoute('', path, noop).params;
	};

	describe('build matcher', function() {

		// I'm missing c# verbatim strings. All those \\/ are needed because
		// in the rexexp / must be escaped with \, and in the string \ must
		// be escaped with another \

		it('should build matcher regex for routes without parameters', function() {
			const r = buildMatcher('/users');
			assert.equal(r.source, '\\/users$');
		});

		it('should build matcher regex for routes with one parameter', function() {
			const r = buildMatcher('/users/:id');
			assert.equal(r.source, '\\/users\\/([^/]+)$');
		});

		it('should build matcher regex for routes with more than one parameters', function() {
			const r = buildMatcher('/users/:id/contact/:contactId');
			assert.equal(r.source, '\\/users\\/([^/]+)\\/contact\\/([^/]+)$');
		});

	});

	describe('extract parameter names', function() {
		it('should return empty array when there are no params', function() {
			const p = getParamNames('/users');
			assert.equal(p.length, 0);
		});

		it('should return parameter names', function() {
			const p = getParamNames('/users/:id/contact/:contactId');
			assert.deepEqual(p, ['id', 'contactId']);
		});
	});
});

describe('getQueryParams', function() {

	it('should return empty object when there are no params', function() {
		const p = getQueryParams('');
		assert.deepEqual(p, {});
	});

	it('should return query parameters', function() {
		const p = getQueryParams('id=1&name=Mark');
		assert.deepEqual(p, {id: 1, name: 'Mark'});
	});
});


describe('getMatchedParams', function() {

	var route = path => createRoute('', path, function(){});

	it('should return falsy when there is no match', function() {
		const m = getMatchedParams(route('/users'), '/company');
		assert(!m);
	});

	it('should return truthy when there is a match with no params', function() {
		const m = getMatchedParams(route('/users'), '/users');
		assert(m);
	});

	it('should return object with parameters when there is a match with params', function() {
		const m = getMatchedParams(
			route('/users/:userId/contacts/:contactId'),
			'/users/4/contacts/12');

		assert(m);
		assert.equal(m.userId, 4);
		assert.equal(m.contactId, 12);
	});

});
