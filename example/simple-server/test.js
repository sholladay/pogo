import { assertEquals, assertStrictEq, runTests, test } from './dev-dependencies.js';
import server from './main.js';

const encoder = new TextEncoder();

test('GET /', async () => {
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(response.body, encoder.encode('hi'));
});

runTests();
