import { assertStrictEq } from './dev-dependencies.ts';
import server from './main.ts';

const { test } = Deno;

test('GET /', async () => {
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(new TextDecoder().decode(response.body),
`<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Counter</title>
    <script type="module" src=\"/app.js\"></script>
</head>
<body>
    <div id="app"></div>
</body>
</html>`);
});
