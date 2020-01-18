import { assertStrictEq, runTests, test } from './dev-dependencies.js';
import server from './main.js';

test('GET /', async () => {
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(response.body, 'hi');
});

runTests();
