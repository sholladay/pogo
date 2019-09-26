# pogo [![Build status for Pogo](https://travis-ci.com/sholladay/pogo.svg?branch=master "Build Status")](https://travis-ci.com/sholladay/pogo "Builds")

> Server framework for [Deno](https://github.com/denoland/deno)

Pogo is an easy to use, safe, and expressive framework for writing web servers and applications. It is inspired by [hapi](https://github.com/hapijs/hapi).

*Supports Deno v0.6.0 and higher.*

## Contents

 - [Why?](#why)
 - [Usage](#usage)
 - [API](#api)
 - [Contributing](#contributing)
 - [License](#license)

## Why?

 - Designed to encourage reliable and testable applications.
 - Routes are simple, pure functions that return values directly.
 - Automatic JSON responses from objects.

## Usage

```js
import pogo from 'https://deno.land/x/pogo/main.js';

const server = pogo.server({ port : 3000 });

server.route({
    method : 'GET',
    path   : '/',
    handler() {
        return 'Hello, world!';
    }
});

server.start();
```

### Adding routes

Adding routes is easy, just call [`server.route()`](#serverrouteoption) and pass it a single route or an array of routes. You can call `server.route()` multiple times. You can even chain calls to `server.route()`, because it returns the server instance.

Add routes in any order you want to, it's safe! Pogo orders them internally by specificity, such that their order of precedence is stable and predictable and avoids ambiguity or conflicts.

```js
server.route([
    { method : 'GET', path : '/hi', handler : () => 'Hello!' },
    { method : 'GET', path : '/bye', handler : () => 'Goodbye!' }
});
```

```js
server.route({ method : 'GET', path : '/hi', handler : () => 'Hello!' });
server.route({ method : 'GET', path : '/bye', handler : () => 'Goodbye!' });
```

```js
server
    .route({ method : 'GET', path : '/hi', handler : () => 'Hello!' });
    .route({ method : 'GET', path : '/bye', handler : () => 'Goodbye!' });
```

You can also configure the route to handle multiple methods by using an array, or `*` to handle all possible methods.

```js
server.route({ method : ['GET', 'POST'], path : '/hi', handler : () => 'Hello!' });
```
```js
server.route({ method : '*', path : '/hi', handler : () => 'Hello!' });
```

### Writing Tests

When it comes time to write tests for your app, Pogo has you covered with [`server.inject()`](serverinjectrequest).

By injecting a request into the server directly, we can completely avoid the need to listen on an available port, make HTTP connections, and all of the problems and complexity that come along with that. You should focus on writing your application logic and `server.inject()` makes that easier.

The server still processes the request using the same code paths that a normal HTTP request goes through, so you can rest assured that your tests are meaningful and realistic.

```js
const response = await server.inject({
    method : 'GET',
    url    : '/users'
});
```

## API

 - [Server](#server)
   - [`server = pogo.server(option)`](#server--pogoserveroption)
   - [`server.inject(request)`](#serverinjectrequest)
   - [`server.route(option)`](#serverrouteoption)
   - [`server.start()`](#serverstart)
 - [Request](#request-1)
   - [`request.body()`](#requestbody)
   - [`request.bodyStream()`](#requestbodystream)
   - [`request.headers`](#requestheaders)
   - [`request.method`](#requestmethod)
   - [`request.params`](#requestparams)
   - [`request.url`](#requesturl)
 - [Response](#response)
   - [`response.body`](#responsebody)
   - [`response.code(statusCode)`](#responsecodestatuscode)
   - [`response.created(url)`](#responsecreatedurl)
   - [`response.header(name, value)`](#responseheadername-value)
   - [`response.headers`](#responseheaders)
   - [`response.location(url)`](#responselocationurl)
   - [`response.permanent()`](#responsepermanent)
   - [`response.redirect(url)`](#responseredirecturl)
   - [`response.rewritable(isRewritable)`](#responserewritableisrewritable)
   - [`response.status`](#responsestatus)
   - [`response.temporary()`](#responsetemporary)
   - [`response.type(mediaType)`](#responsetypemediatype)
 - [Response Toolkit](#response-toolkit)
   - [`h.response(body)`](#hresponsebody)
   - [`h.redirect(url)`](#hredirecturl)

### Server

#### server = pogo.server(option)

Returns a server instance, which can then be used to add routes and start listening for requests.

##### option

Type: `object`

###### hostname

Type: `string`<br>
Default: `'localhost'`

Specifies which domain or IP address the server will listen on when `server.start()` is called. Use `0.0.0.0` to listen on any hostname.

###### port

Type: `number`<br>
Example: `3000`

Specifies which port number the server will listen on when `server.start()` is called. Use `0` to listen on any available port.

#### server.inject(request)

Performs a request directly to the server without using the network. Useful when writing tests, to avoid conflicts from multiple servers trying to listen on the same port number.

Returns a `Promise` for a `Response` instance.

##### request

Type: `object`

###### method

Any valid [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods), such as `GET` or `POST`. Used to lookup the route handler.

###### url

Any valid URL path. Used to lookup the route handler.

#### server.route(option)

Adds a route to the server so that the server knows how to respond to requests for the given HTTP method and path, etc.

##### option

Type: `object` or `array`

###### method

Type: `string`<br>
Example: `GET`

Any valid [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods), or `*` to match all methods. Used to limit which requests will trigger the route handler.

###### path

Type: `string`<br>
Example: `'/users/{userId}'`

Any valid URL path. Used to limit which requests will trigger the route handler.

Supports path parameters with dynamic values, which can be accessed in the handler as `request.params`.

###### handler(request, h)

Type: `function`

 - `request` is a [Request](#request) instance with properties for `headers`, `method`, `url`, and more.
 - `h` is a [Response Toolkit](#response-toolkit) instance, which has utility methods for modifying the response.

The implementation for the route that handles requests. Called when a request is received that matches the `method` and `path` specified in the route options.

The handler must return one of:
 - A `string`, which will be sent as HTML.
 - An `object`, which will be [stringified](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) and sent as JSON.
 - A [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), which will be sent as-is (raw bytes).
 - A [Response](#response) instance, which will send the `response.body`, if any.
 - Any object that implements the [`Reader`](https://deno.land/typedoc/interfaces/_deno_.reader.html) interface, such as a [`File`](https://deno.land/typedoc/classes/_deno_.file.html) or [`Buffer`](https://deno.land/typedoc/classes/_deno_.buffer.html) instance.
 - A [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for any of the above types.

An appropriate [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header will be set automatically based on the response body before the response is sent. You can use [`response.type()`](#responsetypemediatype) to override the default behavior.

#### server.start()

Begins listening on the [`hostname`](#hostname) and [`port`](#port) specified in the server options.

Returns a `Promise` that resolves when the server is listening.

### Request

The `request` object passed to route handlers represents an HTTP [request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#Requests) that was sent to the server. It is an instance of Deno's [`ServerRequest`](https://github.com/denoland/deno_std/blob/a4a8bb2948e5984656724c51a803293ce82c035f/http/server.ts#L100-L202) class, with some additions.

It provides properties and methods for inspecting the content of the request.

#### request.body()

Returns a `Promise` for a [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) containing the raw bytes of the request [body](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#Body).

Note that calling this method will cause the entire body to be read into memory, which is convenient, but may be inappropriate for requests with a very large body. See [`request.bodyStream()`](#requestbodystream) to get the body as a stream, which will improve latency and lower memory usage.

#### request.bodyStream()

Returns an `AsyncGenerator` object, which is an async iterable and async iterator that provides the raw bytes of the request [body](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#Body) in chunks. Useful for requests with a very large body, because streaming is low-latency and memory efficient.

See [`request.body()`](#requestbody) to get the entire body all at once.

#### request.headers

Type: [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers)

Contains the [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) that were sent in the request, such as [`Accept`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept), [`User-Agent`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent), and others.

#### request.method

Type: `string` or `array`<br>
Example: `'GET'`

The [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) associated with the request, such as [`GET`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET) or [`POST`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST).

#### request.params

Type: `object`

Contains the dynamic variables of the `path` in the route configuration, where each key is a variable name and the value is the corresponding part of the request path.

#### request.url

Type: `string`<br>
Example: `'/users/123'`

The URL path associated with the request,

### Response

The `response` object represents an HTTP [response](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#Responses) to the associated `request` that is passed to route handlers. You can access it as `request.response` or create a new response with the [Response Toolkit](#response-toolkit) by calling `h.response()`. It has utility methods that make it easy to modify the headers, status code, and other attributes.

#### response.body

Type: `string` | `object` | [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`Reader`](https://deno.land/typedoc/interfaces/deno.reader.html)

The [body]([body](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#Body_2)) that will be sent in the response. Can be updated by returning a value from the route handler or by creating a new response with [`h.response()`](#hresponsebody) and giving it a value.

#### response.code(statusCode)

Sets the response [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status). When possible, it is better to use a more specific method instead, such as [`response.created()`](#responsecreatedurl) or [`response.redirect()`](#responseredirecturl).

*Tip: Use Deno's [`status`](https://deno.land/std/http/http_status.ts) constants to define the status code.*

```js
import { Status as status } from 'https://deno.land/std/http/http_status.ts';
const handler = (request) => {
    return request.response.code(status.Teapot);
};
```

#### response.created(url)

Sets the response status to [`201 Created`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201) and sets the [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) header to the value of `url`.

Returns the response so other methods can be chained.

#### response.header(name, value)

Sets a response [header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#Headers_2). Always replaces any existing header of the same name. Headers are case insensitive.

Returns the response so other methods can be chained.

#### response.headers

Type: [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers)

Contains the [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) that will be sent in the response, such as [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location), [`Vary`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary), and others.

#### response.location(url)

Sets the [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) header on the response to the value of `url`. When possible, it is better to use a more specific method instead, such as [`response.created()`](#responsecreatedurl) or [`response.redirect()`](#responseredirecturl).

Returns the response so other methods can be chained.

#### response.permanent()

*Only available after calling the `response.redirect()` method.*

Sets the response status to [`301 Moved Permanently`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) or [`308 Permanent Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308) based on whether the existing status is considered rewritable (see "method handling" on [Redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections) for details).

Returns the response so other methods can be chained.

#### response.redirect(url)

Sets the response status to [`302 Found`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) and sets the [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) header to the value of `url`.

Also causes some new response methods to become available for customizing the redirect behavior:

 - [`response.permanent()`](#hpermanent)
 - [`response.temporary()`](#htemporary)
 - [`response.rewritable()`](#hrewritableisrewritable)

Returns the response so other methods can be chained.

#### response.rewritable(isRewritable)

*Only available after calling the `response.redirect()` method.*

Sets the response status to [`301 Moved Permanently`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) or [`302 Found`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) based on whether the existing status is a permanent or temporary redirect code. If `isRewritable` is `false`, then the response status will be set to [`307 Temporary Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307) or [`308 Permanent Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308).

Returns the response so other methods can be chained.

#### response.status

Type: `number`

The [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) that will be sent in the response. Defaults to [`200`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200), which means the request succeeded.

#### response.temporary()

*Only available after calling the `response.redirect()` method.*

Sets the response status to [`302 Found`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) or [`307 Temporary Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307) based on whether the existing status is considered rewritable (see "method handling" on [Redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections) for details).

Returns the response so other methods can be chained.

#### response.type(mediaType)

Sets the [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header on the response to the value of `mediaType`.

Overrides the media type that is set automatically by the framework.

Returns the response so other methods can be chained.

### Response Toolkit

The response toolkit is an object that is passed to route handlers, with utility methods that make it easy to modify the response. For example, you can use it to set headers or a status code.

By convention, this object is assigned to a variable named `h` in code examples.

#### h.redirect(url)

Creates a new response with a redirect status. Shortcut for `h.response().redirect(url)`. See [`response.redirect()`](#responseredirect) for details.

Returns the response so other methods can be chained.

#### h.response(body)

Creates a new response with an optional [body](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#Body_2). This is the same as returning the body directly from the route handler, but it is useful in order to begin a chain with other response methods.

Returns the response so other methods can be chained.

## Contributing

See our [contributing guidelines](https://github.com/sholladay/pogo/blob/master/CONTRIBUTING.md "Guidelines for participating in this project") for more details.

1. [Fork it](https://github.com/sholladay/pogo/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/pogo/compare "Submit code to this project for review").

## License

[MPL-2.0](https://github.com/sholladay/pogo/blob/master/LICENSE "License for pogo") © [Seth Holladay](https://seth-holladay.com "Author of pogo")

Go make something, dang it.
