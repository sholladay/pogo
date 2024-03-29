# Simple Server

This is an example of a very basic Pogo application,

Based on [Hello World](../hello-world), with the following changes:
 - Added a test in [`test.js`](./test.js) that demonstrates the use of [`server.inject()`](../../README.md#serverinjectrequest).
 - Moved the server creation to [`main.ts`](./main.ts) and only start the server in [`run.ts`](./run.ts), so the tests can import the server without starting it.
 - Created [`dependencies.ts`](./dependencies.ts) and [`dev-dependencies.ts`](./dev-dependencies.ts) as a central location to import external dependencies, similar to `package.json` in Node.js.

## Run the example

*Make sure [Deno](https://deno.land/) is installed and up to date.*

### Remote

The fastest way to run the example is to use its URL:

```sh
deno run -A https://deno.land/x/pogo/example/simple-server/run.ts
```

### Local

Alternatively, if you want to play around with the example, run it from a local file:

```sh
curl -fsSL https://github.com/sholladay/pogo/archive/master.tar.gz | tar -xz --strip-components=1 'pogo-master/example'
deno run -A example/simple-server/run.ts
```
