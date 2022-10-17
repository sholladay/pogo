import { assertStrictEq } from './dev-dependencies.ts';
import server from './main.ts';

const { test } = Deno;

test('GET /', async () => {
    const response = await server.inject('/');
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(await response.text(),
`<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <title>Pogo Example | React on Client</title>
        <meta name="viewport" content=\"width=device-width, initial-scale=1.0\">
        <script type="module" src=\"/app.js\"></script>
    </head>
    <body>
        <p>This is an example Pogo app with React client-side rendering.</p>
        <p>Click the buttons below.</p>
        <div id="app"></div>
    </body>
</html>
`
    );
});
