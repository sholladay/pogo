import { assertEquals, assertStrictEq } from 'https://deno.land/std@v0.17.0/testing/asserts.ts';
import { runTests, test } from 'https://deno.land/std@v0.17.0/testing/mod.ts';
import pogo from './main.js';

test('responds with HTML', async () => {
    const server = pogo.server();
    let called = false;
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            called = true;
            return 'hi';
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertEquals(response.body, new TextEncoder().encode('hi'));
    assertStrictEq(response.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assertStrictEq(called, true);
});

test('responds with JSON', async () => {
    const server = pogo.server();
    let called = false;
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            called = true;
            return { foo : 'bar' };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertEquals(response.body, new TextEncoder().encode(JSON.stringify({ foo : 'bar' })));
    assertStrictEq(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
    assertStrictEq(called, true);
});

runTests();
