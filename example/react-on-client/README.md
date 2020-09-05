# React on Client

This is an example Pogo app with React client-side rendering.

Based on [Simple Server](../simple-server), with the following changes:
 - Added [`index.html`](./index.html), where the app will be rendered on the client
 - Added a [`client`](./client) directory with frontend modules such as [`client/app.jsx`](./client/app.jsx)
 - Added [`client/counter.jsx`](./client/counter.jsx), a counter component that uses `React.useState`
 - Added [`bundle.sh`](./bundle.sh), a build script for the frontend app

## Run the example

*Make sure [Deno](https://deno.land/) is installed and up to date.*

### Remote

The fastest way to run the example is to use its URL:

```sh
deno -A https://deno.land/x/pogo/example/react-on-client/run.ts
```

### Local

Alternatively, if you want to play around with the example, run it from a local file:

```sh
curl -fsSL https://github.com/sholladay/pogo/archive/master.tar.gz | tar -xz --strip-components=1 'pogo-master/example'
deno -A example/react-on-client/run.ts
```
