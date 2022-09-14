import { assertStrictEquals, assertStringIncludes } from './dev-dependencies.ts';
import server from './main.tsx';

const { test } = Deno;

test('GET /', async () => {
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStringIncludes(response.body, '<h1>My First Post</h1>');
    assertStringIncludes(response.body, '<h1>My Second Post</h1>');
});
