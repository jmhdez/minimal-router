Minimal Router [![Build Status](https://travis-ci.org/jmhdez/minimal-router.png?branch=master)](https://travis-ci.org/jmhdez/minimal-router)
==============

Minimal Router is a very simplistic router for client-side Javascript applications. It's based on two principles:

* A router must be independent of another framework/libraries, so it must work with plain javascript objects and functions, instead of React components, AngularJS controllers o similar abstractions.

* A router must be independent of navigation and history APIs, so it just needs to be able to register routes and dispatch (i.e. invoke) to route handlers.

There is a more detailed description of the rationale behind Minimal Router in this [design post](http://blog.koalite.com/2016/03/disenando-un-router-para-aplicaciones-spa/) [Spanish only].

If you need a more complex/powerful router, or one integrated with your framework of choice, Minimal Router is not for you. Don't worry, there are plenty of other options to choose from.

Installation
============

The easiest way to use minimal router is to install it as an npm module in your application and bundle it with something like [browserify](http://browserify.org) or [webpack](https://webpack.github.io):

```
npm install minimal-router
```

And then, either `import` or `require` the module:

```javascript

// ES2106
// Import router as the default export from 'minimal-router'
import Router from 'minimal-router'

const router = new Router();


// ES5
// Note that you need to explicitly require .Router
var Router = require('minimal-router').Router

var router = new Router();

```

If you are not using a client-side module bundler (which you probably should), you could  grab the latest version from [https://github.com/jmhdez/minimal-router/blob/master/dist/minimal-router.min.js](https://github.com/jmhdez/minimal-router/blob/master/dist/minimal-router.min.js) and include it in your html:

```
<script src='/path/to/minimal-router-min.js'></script>
<script>
// Note the double Router.Router here
var router = new Router.Router();
</script>
```

And, of course, you could always copy the full code from [Router.js](https://github.com/jmhdez/minimal-router/blob/master/src/Router.js) (about 100 LOC) and build it with your application.


Usage
=====

Once you have a included Minimal Router in your application, you will need to create a `Router` object to be able to define routes and activate them.

```javascript
const router = new Router();
```

Defining routes
---------------

Each route in Minimal Router is defined by an optional `name`, a `path`, and a `handler` function that will be called upon activation.

To register new routes, use the `add` method:

```javascript
// Add an anonymous route
router.add('/users', function() {
  // ...whatever
});


// Add a named route
router.add('product-list', '/catalog/products', function() {
  // ... whatever
});
```

The handler function will receive a single object with two properties `params` and `query`, that will contain the url parameters and the query string arguments.

Parameters can be added to the routes using the syntax `:parameter` in the `path`, and they will passed to the `handler` function inside the `params` property of the arguments:

```javascript
router.add('user-contact', '/user/:userId/contact/:contactId', function({params}) {
  const userId = params.userId;
  const contactId = params.contactId;
  
  // ... do something with userId and contactId
})
```

In addition to parameters, query string values will also be passed to the `handler` function in the `query` property of the arguments:

```javascript
// Route for '/users/madrid?sort=desc
router.add('/users/:city', function({params, query}) {
  const city = params.city;
  const sort = query.sort;
  
  // ... do something with city and sort
});

```

Activating routes
-----------------

Minimal Router does not perform any kind of navigation. Instead, it allows to `dispatch` an `url` to the right route `handler`:

```javascript
router.add('/users', function() {
  console.log('users activated!');
});

router.add('/cats', function() {
  console.log('cats activated!');
});

router.dispatch('/users');
// should print 'users activated!' in the browser console
```

This simple mechanism can be easily integrated with whatever library you are using. For example, if you want to integrate it directly with the [History API](https://developer.mozilla.org/en/docs/Web/API/History), all you need to do is:

```javascript

const router = new Router();

// Enable support for #-based urls instead of HTML5 history API
router.setPrefix('#');

// Add routes
router.add(...);

// Listen browser event for back navigation
window.onpopstate = function(event) {
  // dispatch current url to route
  var path = document.location.hash;
  if (document.location.search.length) {
    path += '?' + document.location.search;
  }
  router.dispatch(path);
};

// Navigate to other routes
const navigate = function(routeName, query, params) {
  const url = router.formatUrl(routeName, query, params);
  history.pushState(null, null, url);
  router.dispatch(path);
};
```

Helper methods
--------------

Although Minimal Router strives to achieve a minimal API, it provides a couple of utility methods to be able to generate urls for named routes and get the route for an url without dispatching it:

```javascript
const router = new Router()
	.setPrefix('#');
	.add('users-by-city', '/users/:city', function() {...});

const url = router.formatUrl('users-by-city', {city: 'madrid'}, {sort: 'desc'});
// url === /users/madrid?sort=desc


const current = router.getCurrentRoute('/users/sevilla');
// current.name === 'users-by-city'
```

Building Minimal Router
=======================

Building your own copy of Minimal Router is easy:

1. Clone the repo.
2. npm install 


Then you have several options:

* Build npm package: `npm run build`
* Build browser package: `npm run build:browser`
* Run tests: `npm test`
* Run tests after each change: `npm run dev`

Copyright and license
=====================

Copyright 2016-Today Juan M. Hernández.

Code licensed under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
