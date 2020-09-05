# React On Server

This is an example Pogo app with React server-side rendering static HTML pages (i.e. webpage templating).

Based on [simple server](../simple-server), with the following changes:
 - Added [`main.tsx`](./main.tsx) JSX with React .
 - Created and used React component [Post](./post.tsx) with passing props.
 - Used `interface` for type definition of component `props`.

## Run the example

*Make sure [Deno](https://deno.land/) is installed and up to date.*

### Remote

The fastest way to run the example is to use its URL:

```sh
deno -A https://deno.land/x/pogo/example/react-on-server/run.ts
```

### Local

Alternatively, if you want to play around with the example, run it from a local file:

```sh
curl -fsSL https://github.com/sholladay/pogo/archive/master.tar.gz | tar -xz --strip-components=1 'pogo-master/example'
deno -A example/react-on-server/run.ts
```
