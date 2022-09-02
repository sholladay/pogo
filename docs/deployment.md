# Deployment

Deploying a Pogo app means uploading your code to another machine, typically a web hosting provider, to make your app available for other people to use.

Any hosting provider that supports Deno should work for Pogo apps. That said, we highly recommend Heroku for its architecture, ease of use, and documentation.

Pogo is designed to behave exactly the same when deployed as it does on your own machine. Unlike some other frameworks, Pogo intentionally does not use any environment variables. Though, it's fine to use them in your app if you want (e.g. to check for development vs production).

## Deploy to [Heroku](https://heroku.com)

Heroku needs the following:
1. A buildpack for Deno. We recommend https://github.com/chibat/heroku-buildpack-deno.
2. A `Procfile` with a script to run your app. Read more about this file at [Heroku: The Procfile](https://devcenter.heroku.com/articles/procfile).
3. Set the server `hostname` option to `'0.0.0.0'` or another publicly available address (see the [security](./security.md) documentation for details).

If you are using `heroku-buildpack-deno`, you can specify the version of Deno to use in a file named `runtime.txt`. For a full example of using this buildpack, see https://github.com/chibat/heroku-deno-getting-started.

## Deploy to [Fly](https://fly.io)

Fly supports two ways to run Deno, which you'll need to choose from:
 - [Deno on Fly using buildpacks](https://fly.io/blog/deno-on-fly-using-buildpacks/)
 - [Deno on Fly using Docker](https://fly.io/blog/deno-on-fly/)

We recommend the buildpack for its simplicity. If you are using the buildpack, your app will need to have a `server.ts` file for it to be detected as a Deno app. Any permissions you need, such as `--allow-net`, should go in a `.permissions` file, as mentioned in the link above.

## Deploy to [Deno Deploy](https://deno.com/deploy)

Deno Deploy works out of the box, with no configuration.

However, note that the runtime environment and available APIs in Deno Deploy are not identical to regular Deno. For example, the compilation options for JSX syntax are different, leading to the need to `import { createElement as h }` when using JSX syntax.

```jsx
import * as pogo from 'https://deno.land/x/pogo/main.ts';
import { createElement as h } from "https://esm.sh/react";

const server = pogo.server();

server.router.get('/', () => {
    return <h1>Hello, World!</h1>;
});

server.start();
```
