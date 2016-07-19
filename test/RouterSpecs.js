// Required to use some browser features
import 'babel-polyfill';

import assert from 'assert';
import Router from '../src/Router.js';

describe('Router', function() {

	var router;

	beforeEach(function() {
		router = new Router();
	});

	describe('registration', function() {
		it('should register simple routes', function () {
			router.add('/cat', _ => console.log('this is a cat'));

			assert.equal(router.routes.length, 1);
			assert.equal(router.routes[0].path, '/cat');
		});

		it('should register routes with parameters', function() {
			router.add('/dog/:id', _ => console.log('this is a dog'));

			assert.equal(router.routes.length, 1);
			assert.equal(router.routes[0].path, '/dog/:id');
		});

		it('should register named routes', function() {
			router.add('users', '/users-path', _ => {});

			assert.equal(router.routes[0].name, 'users');
		});
	});

	describe('dispatching', function() {

		it('should not dispatch to undefined route', function() {

			var dispatched = false;

			router.add('/simple', _ => dispatched = true);

			router.dispatch('/another');

			assert.equal(dispatched, false);
		});

		it('should not dispatch to prefix routes', function() {

			var dispatched = false;

			router.add('/simple', _ => dispatched = true);

			router.dispatch('/simple1');

			assert.equal(dispatched, false);
		});

		it('should dispatch to simple routes', function() {

			var dispatched = false;

			router.add('/simple', _ => dispatched = true);

			router.dispatch('/simple');

			assert.equal(dispatched, true);
		});

		it('should dispatch to the right route', function() {

			let dispatched;

			router.add('/one', _ => dispatched = 'one');
			router.add('/two', _ => dispatched = 'two');

			router.dispatch('/two');

			assert.equal(dispatched, 'two');
		});

		it('should dispatch to routes with parameters', function() {

			let dispatchedId = 0;

			router.add('/dog/:id', ({params}) => dispatchedId = params.id);

			router.dispatch('/dog/4');

			assert.equal(dispatchedId, 4);
		});

		it('should pass query params to dispatched route', function() {

			let dispatchedId = 0,
				queryName = '';

			router.add('/dog/:id', ({params, query}) => {
				dispatchedId = params.id;
				queryName = query.name;
			});

			router.dispatch('/dog/4?name=toby');

			assert.equal(dispatchedId, 4);
			assert.equal(queryName, 'toby');
		});

		it('should dispatch to routes with configured prefix', function() {
			let dispatched = false;

			router.setPrefix('#')
				.add('/users', _ => dispatched = true);

			router.dispatch('#/users');

			assert(dispatched);
		});
	});

	describe('url formatting', function() {

		it('should format url for routes without params', function() {
			router.add('users', '/users-route', _ => {});

			const url = router.formatUrl('users');
			assert.equal(url, '/users-route');
		});

		it('should format url for routes with params', function() {
			router.add('single-contact', '/user/:userId/contact/:contactId', function() {});

			const url = router.formatUrl('single-contact', {userId: 4, contactId: 6});
			assert.equal(url, '/user/4/contact/6');
		});

		it('should format url for routes with params and query string', function() {
			router.add('user', '/user/:id', _ => {});

			const url = router.formatUrl('user', {id: 3}, {order: 'desc'});
			assert.equal(url, '/user/3?order=desc');
		});

		it('should format url for routes with configured prefix', function() {
			router.add('user-list', '/users', _ => {});
			router.setPrefix('#');

			const url = router.formatUrl('user-list');

			assert.equal(url, '#/users');
		});
	});
});
