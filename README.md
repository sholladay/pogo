# pogo [![Build status for Pogo](https://travis-ci.com/sholladay/pogo.svg?branch=master "Build Status")](https://travis-ci.com/sholladay/pogo "Builds")

> Server framework for [Deno](https://github.com/denoland/deno)

Pogo is an easy-to-use, safe, and expressive framework for writing web servers and applications. It is inspired by [hapi](https://github.com/hapijs/hapi).

[Documentation](./docs)

*Supports Deno v1.2.0 and higher.*

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
 - Built-in support for React and JSX.

## Usage

Save the code below to a file named `server.js` and run it with a command like `deno run --allow-net server.js`. Then visit http://localhost:3000 in your browser and you should see "Hello, world!" on the page.

```js
import pogo from 'https://deno.land/x/pogo/main.ts';

const server = pogo.server({ port : 3000 });

server.router.get('/', () => {
    return 'Hello, world!';
});

server.start();
```

The examples that follow will build on this to add more capabilities to the server. Some advanced features may require additional permission flags or different file extensions. If you get stuck or need more concrete examples, be sure to check out the [example projects](./example).

### Adding routes

> A route matches an incoming request to a handler function that creates a response

Adding routes is easy, just call [`server.route()`](#serverrouteroute-options-handler) and pass it a single route or an array of routes. You can call `server.route()` multiple times. You can even chain calls to `server.route()`, because it returns the server instance.

Add routes in any order you want to, it's safe! Pogo orders them internally by specificity, such that their order of precedence is stable and predictable and avoids ambiguity or conflicts.

```js
server.route({ method : 'GET', path : '/hi', handler : () => 'Hello!' });
server.route({ method : 'GET', path : '/bye', handler : () => 'Goodbye!' });
```

```js
server
    .route({ method : 'GET', path : '/hi', handler : () => 'Hello!' });
    .route({ method : 'GET', path : '/bye', handler : () => 'Goodbye!' });
```

```js
server.route([
    { method : 'GET', path : '/hi', handler : () => 'Hello!' },
    { method : 'GET', path : '/bye', handler : () => 'Goodbye!' }
]);
```

You can also configure the route to handle multiple methods by using an array, or `'*'` to handle all possible methods.

```js
server.route({ method : ['GET', 'POST'], path : '/hi', handler : () => 'Hello!' });
```

```js
server.route({ method : '*', path : '/hi', handler : () => 'Hello!' });
```

### Serve static files

#### Using `h.directory()` (recommended)

You can use [`h.directory()`](#hdirectorypath-options) to send any file within a directory based on the request path.

```ts
server.router.get('/movies/{file*}', (request, h) => {
    return h.file('movies');
});
```

#### Using `h.file()`

You can use [`h.file()`](#hfilepath-options) to send a specific file. It will read the file, wrap the contents in a [`Response`](#response), and automatically set the correct [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header. It also has a security feature that prevents path traversal attacks, so it is safe to set the path dynamically (e.g. based on the request URL).

```ts
server.router.get('/', (request, h) => {
    return h.file('dogs.jpg');
});
```

#### Using byte arrays, streams, etc.

If you need more control over how the file is read, there are also more low level ways to send a file, as shown below. However, you'll need to set the content type manually. Also, be sure to not set the path based on an untrusted source, otherwise you may create a path traversal vulnerability. As always, but especially when using any of these low level approaches, we strongly recommend setting Deno's read permission to a particular file or directory, e.g. `--allow-read='.'`, to limit the risk of such attacks.

Using `Deno.readFile()` to get the data as an array of bytes:

```js
server.router.get('/', async (request, h) => {
    const buffer = await Deno.readFile('./dogs.jpg');
    return h.response(buffer).type('image/jpeg');
});
```

Using `Deno.open()` to get the data as a stream to improve latency and memory usage:

```js
server.router.get('/', async (request, h) => {
    const stream = await Deno.open('./dogs.jpg');
    return h.response(stream).type('image/jpeg');
});
```

### React and JSX support

> [JSX](https://reactjs.org/docs/introducing-jsx.html) is a shorthand syntax for JavaScript that looks like [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) and is useful for constructing web pages

You can do webpage templating with [React](https://reactjs.org/) inside of route handlers, using either JSX or [`React.createElement()`](https://reactjs.org/docs/react-api.html#createelement).

Pogo automatically renders React elements using [`ReactDOMServer.renderToStaticMarkup()`](https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup) and sends the response as HTML.

Save the code below to a file named `server.jsx` and run it with a command like `deno --allow-net server.jsx`. The `.jsx` extension is important, as it tells Deno to compile the JSX syntax. You can also use TypeScript by using `.tsx` instead of `.jsx`. The type definitions should load automatically from the Pika CDN, but if you run into problems when using `.tsx`, try loading them manually (see [deno_types](https://github.com/Soremwar/deno_types)).

```jsx
import React from 'https://dev.jspm.io/react';
import pogo from 'https://deno.land/x/pogo/main.ts';

const server = pogo.server({ port : 3000 });

server.router.get('/', () => {
    return <h1>Hello, world!</h1>;
});

server.start();
```

### Writing tests

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

 - [`pogo.server(options)`](#pogoserveroptions)
 - [`pogo.router(options?)`](#pogorouteroptions)
 - [Server](#server)
   - [`server.inject(request)`](#serverinjectrequest)
   - [`server.route(route, options?, handler?)`](#serverrouteroute-options-handler)
   - [`server.router`](#serverrouter)
   - [`server.start()`](#serverstart)
   - [`server.stop()`](#serverstop)
 - [Request](#request-1)
   - [`request.body`](#requestbody)
   - [`request.headers`](#requestheaders)
   - [`request.host`](#requesthost)
   - [`request.hostname`](#requesthostname)
   - [`request.href`](#requesthref)
   - [`request.method`](#requestmethod)
   - [`request.origin`](#requestorigin)
   - [`request.params`](#requestparams)
   - [`request.path`](#requestpath)
   - [`request.raw`](#requestraw)
   - [`request.referrer`](#requestreferrer)
   - [`request.response`](#requestresponse)
   - [`request.route`](#requestroute)
   - [`request.search`](#requestsearch)
   - [`request.searchParams`](#requestsearchparams)
   - [`request.server`](#requestserver)
   - [`request.state`](#requeststate)
   - [`request.url`](#requesturl)
 - [Response](#response)
   - [`response.body`](#responsebody)
   - [`response.code(statusCode)`](#responsecodestatuscode)
   - [`response.created(url?)`](#responsecreatedurl)
   - [`response.header(name, value)`](#responseheadername-value)
   - [`response.headers`](#responseheaders)
   - [`response.location(url)`](#responselocationurl)
   - [`response.permanent()`](#responsepermanent)
   - [`response.redirect(url)`](#responseredirecturl)
   - [`response.rewritable(isRewritable?)`](#responserewritableisrewritable)
   - [`response.state(name, value)`](#responsestatename-value)
   - [`response.status`](#responsestatus)
   - [`response.temporary()`](#responsetemporary)
   - [`response.type(mediaType)`](#responsetypemediatype)
   - [`response.unstate(name)`](#responseunstatename)
 - [Response Toolkit](#response-toolkit)
   - [`h.directory(path, options?)`](#hdirectorypath-options)
   - [`h.file(path, options?)`](#hfilepath-options)
   - [`h.redirect(url)`](#hredirecturl)
   - [`h.response(body?)`](#hresponsebody)
 - [Router](#router)
   - [`router.add(route, options?, handler?)`](#routeraddroute-options-handler)
   - [`router.all(route, options?, handler?)`](#routerallroute-options-handler)
   - [`router.delete(route, options?, handler?)`](#routerdeleteroute-options-handler)
   - [`router.get(route, options?, handler?)`](#routergetroute-options-handler)
   - [`router.lookup(method, path)`](#routerlookupmethod-path)
   - [`router.patch(route, options?, handler?)`](#routerpatchroute-options-handler)
   - [`router.post(route, options?, handler?)`](#routerpostroute-options-handler)
   - [`router.put(route, options?, handler?)`](#routerputroute-options-handler)
   - [`router.routes`](#routerroutes)

### pogo.server(options)

Returns a [`Server`](#server) instance, which can then be used to add routes and start listening for requests.

```js
const server = pogo.server();
```

#### options

Type: `object`

##### catchAll

Type: `function`

Optional route handler to be used as a fallback for requests that do not match any other route. This overrides the default 404 Not Found behavior built into the framework. Shortcut for `server.router.all('/{catchAll*}', catchAll)`.

```js
const server = pogo.server({
    catchAll(request, h) {
        return h.response('the void').code(404);
    }
});
```

##### certFile

Type: `string`\
Example: `'/path/to/file.cert'`

Optional filepath to an X.509 [public key certificate](https://en.wikipedia.org/wiki/Public_key_certificate) for the server to read when [`server.start()`](#serverstart) is called, in order to set up HTTPS. Requires the use of the `keyFile` option.

##### hostname

Type: `string`\
Default: `'localhost'`

Optional [domain](https://en.wikipedia.org/wiki/Domain_name) or [IP address](https://en.wikipedia.org/wiki/IP_address) for the server to listen on when [`server.start()`](#serverstart) is called. Use `'0.0.0.0'` to listen on all available addresses, as mentioned in the [security](./docs/security.md) documentation.

##### keyFile

Type: `string`\
Example: `'/path/to/file.key'`

Optional filepath to a private key for the server to read when [`server.start()`](#serverstart) is called, in order to set up HTTPS. Requires the use of the `certFile` option.

##### port

Type: `number`\
Example: `3000`

Any valid [port](https://en.wikipedia.org/wiki/Port_(computer_networking)) number (`0` to `65535`) for the server to listen on when [`server.start()`](#serverstart) is called. Use `0` to listen on an available port assigned by the operating system.

### pogo.router(options?)

Returns a [`Router`](#router) instance, which can then be used to add routes.

```js
const router = pogo.router();
```

### Server

The `server` object returned by `pogo.server()` represents your [web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_web_server). When you start the server, it begins listening for HTTP requests, processes those requests when they are received, and makes the content within each request available to the route handlers that you specify.

#### server.inject(request)

Performs a request directly to the server without using the network. Useful when writing tests, to avoid conflicts from multiple servers trying to listen on the same port number.

Returns a `Promise` for a [`Response`](#response) instance.

```js
const response = await server.inject({
    method : 'GET',
    url    : '/'
});
```

##### request

Type: `object`

###### method

Type: `string`\
Example: `'GET'`

Any valid [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods), such as `GET` or `POST`. Used to lookup the route handler.

###### url

Type: `string`\
Example: `'/'`

Any valid URL path. Used to lookup the route handler.

#### server.route(route, options?, handler?)

Adds a route to the server so that the server knows how to respond to requests that match the given [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) and URL path. Shortcut for `server.router.add()`.

Returns the server so other methods can be chained.

```js
server.route({ method : 'GET', path : '/', handler : () => 'Hello, World!' });
```
```js
server.route({ method : 'GET', path : '/' }, () => 'Hello, World!');
```
```js
server.route('/', { method : 'GET' }, () => 'Hello, World!');
```

##### route

Type: `object` | `string` | `Router` | `Array<object | string | Router>`

###### method

Type: `string` | `Array<string>`\
Example: `'GET'`

Any valid [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods), array of methods, or `'*'` to match all methods. Used to limit which requests will trigger the route handler.

###### path

Type: `string`\
Example: `'/users/{userId}'`

Any valid URL path. Used to limit which requests will trigger the route handler.

Supports path parameters with dynamic values, which can be accessed in the handler as [`request.params`](#requestparams).

###### handler(request, h)

Type: `function`

 - `request` is a [`Request`](#request) instance with properties for `headers`, `method`, `url`, and more.
 - `h` is a [Response Toolkit](#response-toolkit) instance, which has utility methods for modifying the response.

The implementation for the route that handles requests. Called when a request is received that matches the `method` and `path` specified in the route options.

The handler must return one of:
 - A `string`, which will be sent as HTML.
 - An `object`, which will be [stringified](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) and sent as JSON.
 - A [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), which will be sent as-is (raw bytes).
 - A [`Response`](#response), which will send the `response.body`, if any.
 - Any object that implements the [`Reader`](https://deno.land/typedoc/interfaces/_deno_.reader.html) interface, such as a [`File`](https://deno.land/typedoc/classes/_deno_.file.html) or [`Buffer`](https://deno.land/typedoc/classes/_deno_.buffer.html).
 - An [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error), which will send an appropriate HTTP error code - returning an error is the same as `throw`ing it.
 - A [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for any of the above types.

An appropriate [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header will be set automatically based on the response body before the response is sent. You can use [`response.type()`](#responsetypemediatype) to override the default behavior.

#### server.router

Type: [`Router`](#router)

The route manager for the server, which contains the routing table for all known routes, as well as various methods for adding routes to the routing table.

#### server.start()

Begins listening for requests on the [`hostname`](#hostname) and [`port`](#port) specified in the server options.

Returns a `Promise` that resolves when the server is listening.

```js
await server.start();
console.log('Listening for requests');
```

#### server.stop()

Stops accepting new requests. Any existing requests that are being processed will not be interrupted.

Returns a `Promise` that resolves when the server has stopped listening.

```js
await server.stop();
console.log('Stopped listening for requests');
```

### Request

The `request` object passed to route handlers represents an HTTP [request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#Requests) that was sent to the server. It is similar to an instance of Deno's [`ServerRequest`](https://doc.deno.land/https/deno.land/std/http/mod.ts#ServerRequest) class, with some additions.

It provides properties and methods for inspecting the content of the request.

#### request.body

Type: [`Reader`](https://deno.land/typedoc/interfaces/deno.reader.html)

The HTTP [body](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#Body) value.

To get the body as a string, pass it to [`Deno.readAll()`](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.readAll) and decode the result, as shown below. Note that doing so will cause the entire body to be read into memory all at once, which is convenient and fine in most cases, but may be inappropriate for requests with a very large body.

```js
server.router.post('/users', async (request) => {
    const bodyText = new TextDecoder().decode(await Deno.readAll(request.body));
    const user = JSON.parse(bodyText);
    // ...
});
```

If you want more control over how the stream is processed, instead of reading it all into memory, you can read raw bytes from the body in chunks with `request.body.read()`. It takes a [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) as an argument to copy the bytes into and returns a `Promise` for either the number of bytes read or `null` when the body is finished being read. In the example below, we read up to a maximum of 20 bytes from the body.

```js
server.router.post('/data', (request) => {
    const buffer = new Uint8Array(20);
    const numBytesRead = await request.body.read(buffer);
    const data = new TextDecoder().decode(buffer.subarray(0, numBytesRead));
    // ...
});
```

#### request.headers

Type: [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers)

Contains the [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) that were sent in the request, such as [`Accept`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept), [`User-Agent`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent), and others.

#### request.host

Type: `string`\
Example: `'localhost:3000'`

The value of the HTTP [`Host`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host) header, which is a combination of the hostname and port at which the server received the request, separated by a `:` colon. Useful for returning different content depending on which URL your visitors use to access the server. Shortcut for `request.url.host`.

To get the hostname, which does not include the port number, see [`request.hostname`](#requesthostname).

#### request.hostname

Type: `string`\
Example: `'localhost'`

The hostname part of the HTTP [`Host`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host) header. That is, the domain or IP address at which the server received the request, without the port number. Useful for returning different content depending on which URL your visitors use to access the server. Shortcut for `request.url.hostname`.

To get the host, which includes the port number, see [`request.host`](#requesthostname).

#### request.href

Type: `string`\
Example: `'http://localhost:3000/page.html?query'`

The full URL associated with the request, represented as a string. Shortcut for `request.url.href`.

To get this value as a parsed object instead, use [`request.url`](#requesturl).

#### request.method

Type: `string`\
Example: `'GET'`

The [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) associated with the request, such as [`GET`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET) or [`POST`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST).

#### request.origin

Type: `string`\
Example: `'http://localhost:3000'`

The scheme and host parts of the request URL. Shortcut for `request.url.origin`.

#### request.params

Type: `object`

Contains the name/value pairs of [path parameters](./docs/routing.md#parameters), where each key is a parameter name from the route path and the value is the corresponding part of the request path. Shortcut for `request.route.params`.

#### request.path

Type: `string`\
Example: `/page.html`

The path part of the request URL, excluding the query. Shortcut for `request.url.pathname`.

#### request.raw

Type: [`ServerRequest`](https://doc.deno.land/https/deno.land/std/http/mod.ts#ServerRequest)

The original request object from Deno's `http` module, upon which many of the other request properties are based.

*You probably don't need this. It is provided as an escape hatch, but using it is not recommended.*

#### request.referrer

Type: `string`

The value of the HTTP [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) header, which is useful for determining where the request came from. However, not all user agents send a referrer and the value can be influenced by various mechanisms, such as [`Referrer-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy). As such, it is recommended to use the referrer as a hint, rather than relying on it directly.

Note that this property uses the correct spelling of "referrer", unlike the header. It will be an empty string if the header is missing.

#### request.response

Type: [`Response`](#response)

The response that will be sent for the request. To create a new response, see [`h.response()`](#hresponsebody).

#### request.route

Type: `object`

The route that is handling the request, as given to [`server.route()`](#serverrouteroute-options-handler), with the following additional properties:
 - `params` is an object with properties for each dynamic path parameter
 - `segments` is an array of path parts, as in the values separated by `/` slashes in the route path

#### request.search

Type: `string`\
Example: `'?query'`

The query part of the request URL, represented as a string. Shortcut for `request.url.search`.

To get this value as a parsed object instead, use [`request.searchParams`](#requestsearchparams).

#### request.searchParams

Type: [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

The query part of the request URL, represented as an object that has methods for working with the query parameters. Shortcut for `request.url.searchParams`.

To get this value as a string instead, use [`request.search`](#requestsearch).

#### request.server

Type: [`Server`](#server)

The server that is handling the request.

#### request.state

Type: `object`

Contains the name/value pairs of the HTTP [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) header, which is useful for keeping track of state across requests, e.g. to keep a user logged in.

#### request.url

Type: [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)

The full URL associated with the request, represented as an object that contains properties for various parts of the URL,

To get this value as a string instead, use [`request.href`](#requesthref). In some cases, the URL object itself can be used as if it were a string, because it has a smart `.toString()` method.

### Response

The `response` object represents an HTTP [response](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#Responses) to the associated `request` that is passed to route handlers. You can access it as `request.response` or create a new response with the [Response Toolkit](#response-toolkit) by calling `h.response()`. It has utility methods that make it easy to modify the headers, status code, and other attributes.

#### response.body

Type: `string` | `object` | [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`Reader`](https://deno.land/typedoc/interfaces/deno.reader.html)

The [body]([body](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#Body_2)) that will be sent in the response. Can be updated by returning a value from the route handler or by creating a new response with [`h.response()`](#hresponsebody) and giving it a value.

#### response.code(statusCode)

Sets the response [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status). When possible, it is better to use a more specific method instead, such as [`response.created()`](#responsecreatedurl) or [`response.redirect()`](#responseredirecturl).

Returns the response so other methods can be chained.

*Tip: Use Deno's [`status`](https://deno.land/std/http/http_status.ts) constants to define the status code.*

```js
import { Status as status } from 'https://deno.land/std/http/http_status.ts';
const handler = (request, h) => {
    return h.response().code(status.Teapot);
};
```

#### response.created(url?)

Sets the response status to [`201 Created`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201) and sets the [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) header to the value of `url`, if provided.

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

 - [`response.permanent()`](#responsepermanent)
 - [`response.temporary()`](#responsetemporary)
 - [`response.rewritable()`](#responserewritableisrewritable)

Returns the response so other methods can be chained.

#### response.rewritable(isRewritable?)

*Only available after calling the `response.redirect()` method.*

Sets the response status to [`301 Moved Permanently`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) or [`302 Found`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) based on whether the existing status is a permanent or temporary redirect code. If `isRewritable` is `false`, then the response status will be set to [`307 Temporary Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307) or [`308 Permanent Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308).

Returns the response so other methods can be chained.

#### response.state(name, value)

Sets the [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) header to create a cookie with the given `name` and `value`. Cookie options can be specified by using an object for `value`. See Deno's [cookie](https://doc.deno.land/https/deno.land/std/http/cookie.ts#Cookie) interface for the available options.

Returns the response so other methods can be chained.

All of the following forms are supported:

```js
response.state('color', 'blue');
response.state('color', { value : 'blue' });
response.state({ name : 'color', value : 'blue' });
```

#### response.status

Type: `number`\
Example: [`418`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418)

The [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) that will be sent in the response. Defaults to [`200`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200), which means the request succeeded. 4xx and 5xx codes indicate an error.

#### response.temporary()

*Only available after calling the `response.redirect()` method.*

Sets the response status to [`302 Found`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) or [`307 Temporary Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307) based on whether the existing status is considered rewritable (see "method handling" on [Redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections) for details).

Returns the response so other methods can be chained.

#### response.type(mediaType)

Sets the [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header on the response to the value of `mediaType`.

Overrides the media type that is set automatically by the framework.

Returns the response so other methods can be chained.

#### response.unstate(name)

Sets the [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) header to clear the cookie given by `name`.

Returns the response so other methods can be chained.

### Response Toolkit

The response toolkit is an object that is passed to route handlers, with utility methods that make it easy to modify the response. For example, you can use it to set headers or a status code.

By convention, this object is assigned to a variable named `h` in code examples.

#### h.directory(path, options?)

Creates a new response with a body containing the contents of the directory or file specified by `path`.

Returns a `Promise` for the response.

```ts
server.router.get('/movies/{file*}', (request, h) => {
    return h.directory('movies');
});
```

The directory or file that is served is determined by joining the path given to `h.directory()` with the value of the last path paraeter of the route, if any. This allows you to control whether the directory root or files within it will be accessible, by using a particular type of path parameter or lack thereof.

 - A route with `path: '/movies'` will only serve the directory itself, meaning it will only work if the `listing` option is enabled (or if the path given to `h.directory()` is actually a file instead of a directory), otherwise a `403 Forbidden` error will be thrown.
 - A route with `path: '/movies/{file}'` will only serve the directory's children, meaning that a request to `/movies/` will return a `404 Not Found`, even if the `listing` option is enabled.
 - A route with `path: '/movies/{file?}'` will serve the directory itself and the directory's children, but not any of the directory's grandchildren or deeper descendants.
 - A route with `path: '/movies/{file*}'` will serve the directory itself and any of the directory's descendants, including children and granchildren.

Note that the name of the path parameter (`file` in the example above) does not matter, it can be anything, and the name itself won't affect the directory helper or the response in any way. You should consider it a form of documentation and choose a name that is appropriate and intuitive for your use case. By convention, we usually name it `file`.

##### options

Type: `object`

###### listing

Type: `boolean`\
Default: `false`

If `true`, enables directory listings, so that when the request path matches a directory (as opposed to a file), the response will be an HTML page that shows some info about the directory's children. including file names, file sizes, and timestamps for when the files were created and modified.

By default, directory listings are disabled for improved privacy, and instead a `403 Forbidden` error will be thrown when the request matches a directory.

Note that this option does not affect which files within the directory are accessible. For example, with a route of `/movies/{file*}` and `listing: false`, the user could still access `/movies/secret.mov` if they knew (or were able to guess) that such a file exists. Conversely, with a route of `/movies` and `listing: true`, the user would be unable to access `/movies/secret.mov` or see its contents, but they could see that it exists in the directory listing.

To control which files are accessible, you can change the route path parameter or use `h.file()` to serve specific files.

#### h.file(path, options?)

Creates a new response with a body containing the contents of the file specified by `path`. Automatically sets the [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header based on the file extension.

Returns a `Promise` for the response.

```ts
server.router.get('/', (request, h) => {
    return h.file('index.html');
});
```

##### options

Type: `object`

###### confine

Type: `boolean` | `string`\
Default: [`Deno.cwd()`](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.cwd) (current working directory)

Optional directory path used to limit which files are allowed to be accessed, which is important in case the file path comes from an untrusted source, such as the request URL. Any file inside of the `confine` directory will be accessible, but attempting to access any file outside of the `confine` directory will throw a [`403 Forbidden`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403) error. Set to `false` to disable this security feature.

#### h.redirect(url)

Creates a new response with a redirect status. Shortcut for `h.response().redirect(url)`. See [`response.redirect()`](#responseredirect) for details.

Returns the response so other methods can be chained.

#### h.response(body?)

Creates a new response with an optional [body](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#Body_2). This is the same as returning the body directly from the route handler, but it is useful in order to begin a chain with other response methods.

Returns the response so other methods can be chained.

### Router

Documentation: [Routing](./docs/routing.md)

A router is used to store and lookup routes. The server has a built-in router at [`server.router`](#serverrouter), which it uses to match an incoming request to a route handler function that generates a response. You can use the server's router directly or you can create a custom router with `pogo.router()`.

To copy routes from one router to another, see [`router.add()`](#routeraddroute-options-handler). You can pass a custom router to `server.route()` or `server.router.add()` to copy its routes into the server's built-in router, thus making those routes available to incoming requests.

Note that you don't necessarily need to create a custom router. You only need to create your own router if you prefer the chaining syntax for defining routes and you want to export the routes from a file that doesn't have access to the server. In other words, a custom router is useful for larger applications.

```js
const server = pogo.server();
server.router
    .get('/', () => {
        return 'Hello, World!';
    })
    .get('/status', () => {
        return 'Everything is swell!';
    });
```

```js
const router = pogo.router()
    .get('/', () => {
      return 'Hello, World!';
    })
    .get('/status', () => {
      return 'Everything is swell!';
    });

const server = pogo.server();
server.route(router);
```

#### router.add(route, options?, handler?)

Adds one or more routes to the routing table, which makes them available for lookup, e.g. by a server trying to match an incoming request to a handler function.

The `route` argument can be:
 - A route object with optional properties for `method`, `path`, and `handler`
   - `method` is an HTTP method string or array of strings
   - `path` is a URL path string
   - `handler` is a function
 - A string, where it will be used as the path
 - A `Router` instance, where its routing table will be copied
 - An array of the above types

The `options` argument can be a route object (same as `route`) or a function, where it will be used as the handler.

The `handler` function can be a property of a `route` object, a property of the `options` object, or it can be a standalone argument.

Each argument has higher precedence than the previous argument, allowing you to pass in a route but override its handler, for example, by simply passing a handler as the final argument.

Returns the router so other methods can be chained.

```js
const router = pogo.router().add('/', { method : '*' }, () => 'Hello, World!');
```

#### router.all(route, options?, handler?)

Shortcut for [`router.add()`](#routeraddroute-options-handler), with `'*'` as the default HTTP method.

Returns the router so other methods can be chained.

```js
const router = pogo.router().all('/', () => 'Hello, World!');
```

#### router.delete(route, options?, handler?)

Shortcut for [`router.add()`](#routeraddroute-options-handler), with [`'DELETE'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE) as the default HTTP method.

Returns the router so other methods can be chained.

```js
const router = pogo.router().delete('/', () => 'Hello, World!');
```

#### router.get(route, options?, handler?)

Shortcut for [`router.add()`](#routeraddroute-options-handler), with [`'GET'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET) as the default HTTP method.

Returns the router so other methods can be chained.

```js
const router = pogo.router().get('/', () => 'Hello, World!');
```

#### router.lookup(method, path)

Look up a route that matches the given `method` and `path`.

Returns the route object with an additional `params` property that contains path parameter names and values.

#### router.patch(route, options?, handler?)

Shortcut for [`router.add()`](#routeraddroute-options-handler), with [`'PATCH'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH) as the default HTTP method.

Returns the router so other methods can be chained.

```js
const router = pogo.router().patch('/', () => 'Hello, World!');
```

#### router.post(route, options?, handler?)

Shortcut for [`router.add()`](#routeraddroute-options-handler), with [`'POST'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) as the default HTTP method.

Returns the router so other methods can be chained.

```js
const router = pogo.router().post('/', () => 'Hello, World!');
```

#### router.put(route, options?, handler?)

Shortcut for [`router.add()`](#routeraddroute-options-handler), with [`'PUT'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT) as the default HTTP method.

Returns the router so other methods can be chained.

```js
const router = pogo.router().put('/', () => 'Hello, World!');
```

#### router.routes

Type: `object`

The routing table, which contains all of the routes that have been added to the router.

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
