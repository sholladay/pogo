# Routing

Routing is how we can match a request to a particular handler function, which then determines how to respond. So, instead of responding to every request with a dog sound, for example, we can respond to _some_ requests with a cat sound.

```ts
import pogo from 'https://deno.land/x/pogo/main.ts';

const server = pogo.server({ port : 3000 });
server.router.get('/{any*}', () => {
    return 'Woof!';
});
server.router.get('/cats', () => {
    return 'Meow!';
});

server.start();
```

Using the code above and visiting http://localhost:3000, you would see, "Woof!" You would also see "Woof!" if you visited http://localhost:3000/abc or just about any other path. However, if you visited http://localhost:3000/cats, you would see "Meow!"

## Semantics

A route consists of, at minimum, a `method`, `path`, and `handler`. It can also have an optional `vhost`, which restricts the route to handling requests with a matching [`Host`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host) header, which is useful for [virtual hosting](https://en.wikipedia.org/wiki/Virtual_hosting).

The order of routes does not matter. The routes are sorted internally by specificity, so the result is clear and deterministic. Routes are given priority for having a static `path` (no parameter), for having a `vhost`, and for using a specific `method` instead of a wildcard (`'*'` or `.all()`), in that order.

Pogo is designed so that each request is handled by, at most, one route. Even if more than one route could potentially match the request, only the most specific route will be used. This allows routes to be registered in any order and makes the request lifecycle easier to understand and debug.

## Parameters

Route paths can be either static or dynamic. A static route path, such as `/dogs`, is static because it will only ever match a request for `/dogs`, exactly. Sometimes, though, it can be useful for routes to match requests in a more flexible way. For example, we could have a `/dogs/{id}` route that will match requests such as `/dogs/1` and `/dogs/2`. Here, the `{id}` part is a _path parameter_. It represents a named part of the path whose value won't be known until a matching request is received.

Parameters start with a `{` left curly brace and end with a `}` right curly brace. In between the braces, the parameter has a name which can be one or more letters, numbers, and underscores. Optionally, after the parameter name but before the right curly brace, a quantifier can be used. The quanitifers that are supported are the `?` question mark, meaning the parameter is optional (route will match requests both with and without a value in that position), and the `*` wildcard to match an unlimited number of path components.

Examples:

 - Required parameter: `/dogs/{id}` will match `/dogs/1`, but NOT `/dogs/` or `/dogs/1/foo`
 - Optional parameter: `/dogs/{id?}` will match `/dogs/` and `/dogs/1`, but NOT `/dogs/1/foo`
 - Wildcard parameter: `/dogs/{id*}` will match `/dogs/` and `/dogs/1` and `/dogs/1/foo`

## Conflicts

To catch mistakes, the router checks for conflicts and throws an error if two routes have an identical combination of `method`, `vhost`, and `path` values.

To accomplish this, each route is assigned a conflict ID. For example, `server.router.get('/', () => {})` has a conflict ID of `'GET /'` and `server.router.all({ vhost : 'foo.com', path : '/abc' })` has a conflict ID of `'* foo.com/abc'`. These conflict IDs are checked for uniqueness when the route is added to a router.

Note that routes _are_ allowed to mask each other, so you can have a `'* /foo'` route and a `'GET /foo'` route, where the `'GET'` route will be used if appropriate. However, you cannot have two `'GET /foo'` routes or two `'* /foo'` routes. You can, of course, run any number of functions from within your route handler.

## Resources

 - [`server.route()`](https://github.com/sholladay/pogo#serverrouteroute-options-handler)
 - [`server.router`](https://github.com/sholladay/pogo#serverrouter)
 - [`pogo.router()`](https://github.com/sholladay/pogo#pogorouteroptions)
 - [`Router` API](https://github.com/sholladay/pogo#router)
