import { assertStrictEquals } from './dev-dependencies.ts';
import server from './main.ts';

const { test } = Deno;

test('GET /', async () => {
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(response.body, 'Hello, world!');
});
