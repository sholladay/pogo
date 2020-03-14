import { assertStrictEq } from './dev-dependencies.ts';
import server from './main.ts';

const { runTests, test } = Deno;

test('GET /', async () => {
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(response.body, 'hi');
});

await runTests();
