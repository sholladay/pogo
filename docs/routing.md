# Routing

Routing is how we can match a request to a particular handler function, which then determines how to respond. So, instead of responding to every request with a dog sound, for example, we can respond to _some_ requests with a cat sound.

```js
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

## Conflicts

To catch mistakes, the router checks for conflicts and throws an error if two routes have an identical combination of `method`, `vhost`, and `path` values.

To accomplish this, each route is assigned a conflict ID. For example, `server.router.get('/', () => {})` has a conflict ID of `'GET /'` and `server.router.all({ vhost : 'foo.com', path : '/abc' })` has a conflict ID of `'* foo.com/abc'`. These conflict IDs are checked for uniqueness when the route is added to a router.

Note that routes _are_ allowed to mask each other, so you can have a `'* /foo'` route and a `'GET /foo'` route, where the `'GET'` route will be used if appropriate. However, you cannot have two `'GET /foo'` routes or two `'* /foo'` routes. You can, of course, run any number of functions from within your route handler.

## Resources

 - [`server.route()`](https://github.com/sholladay/pogo#serverrouteroute)
 - [`server.router`](https://github.com/sholladay/pogo#serverrouter)
 - [`pogo.router()`](https://github.com/sholladay/pogo#pogorouteroption)
 - [`Router` API](https://github.com/sholladay/pogo#router)
