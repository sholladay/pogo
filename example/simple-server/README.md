# Simple Server

This is an example of a very basic application, similar to [Hello World](../hello-world), but with the following changes:
 - Added a test in `test.js` that demonstrates the use of [`server.inject()`](../../README.md#serverinjectrequest).
 - Moved the server creation to `main.js` and only start the server in `run.js`, so the tests can import the server without starting it.
 - Created `dependencies.js` and `dev-dependencies.js` as a central location to import external dependencies, similar to `package.json` in Node.js.

## Run the example

*Make sure [Deno](https://deno.land/) is installed and up to date.*

### Remote

The fastest way to run the example is to use its URL:

```sh
deno -A https://deno.land/x/pogo/example/simple-server/run.js
```

### Local

Alternatively, if you want to play around with the example, run it from a local file:

```sh
curl -fsSL https://github.com/sholladay/pogo/archive/master.tar.gz | tar -x --strip-components=1 'pogo-master/example'
deno -A example/simple-server/run.js
```
