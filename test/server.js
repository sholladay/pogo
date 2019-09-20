import { assertEquals, assertStrictEq } from 'https://deno.land/std@v0.17.0/testing/asserts.ts';
import { runTests, test } from 'https://deno.land/std@v0.17.0/testing/mod.ts';
import pogo from '../main.js';

const encoder = new TextEncoder();

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
    assertEquals(response.body, encoder.encode('hi'));
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
    assertEquals(response.body, encoder.encode(JSON.stringify({ foo : 'bar' })));
    assertStrictEq(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
    assertStrictEq(called, true);
});

test('dynamic routes', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/users/{userId}',
        handler(request) {
            return request.params;
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/users/123'
    });
    assertEquals(response.body, encoder.encode(JSON.stringify({ userId : '123' })));
    assertStrictEq(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
});

runTests();
