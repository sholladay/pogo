# Hello World

This is an example of a "[Hello, World!](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program)" application, which is as simple as one can get.

In `run.js`, you can see what it is like to configure and start the server, add a route, and respond to a request with a simple value.

## Run the example

*Make sure [Deno](https://deno.land/) is installed and up to date.*

### Remote

The fastest way to run the example is to use its URL:

```sh
deno https://deno.land/x/pogo/example/hello-world/run.js
```

### Local

Alternatively, if you want to play around with the example, run it from a local file:

```sh
curl -fsSL https://github.com/sholladay/pogo/archive/master.tar.gz | tar -x --strip-components=1 'pogo-master/example'
deno example/hello-world/run.js
```
