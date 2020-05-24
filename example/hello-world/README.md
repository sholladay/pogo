# Hello World

This is an example of a "[Hello, World!](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program)" application, which is as simple as one can get.

In `run.ts`, you can see what it is like to configure and start the server, add a route, and respond to a request with a simple value.

## Run the example

*Make sure [Deno](https://deno.land/) is installed and up to date.*

### Remote

The fastest way to run the example is to use its URL:

```sh
deno -A https://deno.land/x/pogo/example/hello-world/run.ts
```

### Local

Alternatively, if you want to play around with the example, run it from a local file:

```sh
curl -fsSL https://github.com/sholladay/pogo/archive/master.tar.gz | tar -xz --strip-components=1 'pogo-master/example'
deno -A example/hello-world/run.ts
```

## What's next?

When you are done with this example, check out [Simple Server](../simple-server) to see some other features of Pogo and how you can write tests for your app.
