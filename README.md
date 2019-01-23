# pogo [![Build status for Pogo](https://travis-ci.com/sholladay/pogo.svg?branch=master "Build Status")](https://travis-ci.com/sholladay/pogo "Builds")

> Web framework for [Deno](https://github.com/denoland/deno)

Pogo is an easy to use, safe, and expressive framework for writing web servers and applications. It is inspired by [hapi](https://github.com/hapijs/hapi).

## Why?

 - Designed to encourage reliable and testable applications.
 - Routes are simple, pure functions that return values directly.
 - Automatic JSON responses from objects.

## Usage

```js
import pogo from 'https://raw.githubusercontent.com/sholladay/pogo/master/main.js';

const app = pogo.server({ port : 3000 });

app.route({
    method : 'GET',
    path   : '/hello',
    handler() {
        return 'Hello, world!';
    }
});

app.start();
```

*Note: This project is experimental. It works, but the API is far from complete.*

## API

### server = pogo.server(option)

Returns a server instance, which can be used to add routes and

#### option

Type: `object`

##### hostname

Type: `string`<br>
Default: `localhost`

Specifies which domain or IP address to listen on. Use `0.0.0.0` to listen on any hostname.

##### port

Type: `number`<br>
Example: `3000`

Specifies which port number to listen on.

### server.route(option)

Adds a route to the server so that the server knows how to respond to requests for the given route.

#### option

Type: `object`

##### method

Type: `string`<br>
Example: `GET`

Any valid HTTP method. Used to limit which requests will trigger the route handler.

##### path

Type: `string`<br>
Example: `/`

Any valid URL path. used to limit which requests will trigger the route handler.

##### handler(request)

Type: `function`

The implementation for the route that handles requests. Called when a request is received that matches the `method` and `path` specified in the route configuration.

Should return a value suitable for `JSON.stringify()`. Strings are treated as HTML, objects are treated as JSON.

### server.start()

Begins listening on the `hostname` and `port` specified when the server was created.

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
