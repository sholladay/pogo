# React on Client

This is an example Pogo app with React client-side rendering.

Based on [Simple Server](../simple-server), but with the following changes:
 - Added client rendering on browser [`app.jsx`](./client/app.jsx).
 - Used browser features with `React.useState` [`counter.jsx`](./client/counter.jsx).
 - Added build step for client [`bundle.sh`](./bundle.sh).

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
