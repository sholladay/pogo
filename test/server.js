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

test('route with dynamic path', async () => {
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

test('server.route() can be chained', async () => {
    const server = pogo.server();
    server
        .route({
            method : 'GET',
            path   : '/a',
            handler() {
                return 'a';
            }
        })
        .route({
            method : 'GET',
            path   : '/b',
            handler() {
                return 'b';
            }
        });
    const responseA = await server.inject({
        method : 'GET',
        url    : '/a'
    });
    const responseB = await server.inject({
        method : 'GET',
        url    : '/b'
    });
    assertEquals(responseA.body, encoder.encode('a'));
    assertStrictEq(responseA.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assertEquals(responseB.body, encoder.encode('b'));
    assertStrictEq(responseB.headers.get('Content-Type'), 'text/html; charset=utf-8');
});

test('array of routes', async () => {
    const server = pogo.server();
    server.route([
        {
            method : 'GET',
            path   : '/a',
            handler() {
                return 'a';
            }
        },
        {
            method : 'GET',
            path   : '/b',
            handler() {
                return 'b';
            }
        }
    ]);
    const responseA = await server.inject({
        method : 'GET',
        url    : '/a'
    });
    const responseB = await server.inject({
        method : 'GET',
        url    : '/b'
    });
    assertEquals(responseA.body, encoder.encode('a'));
    assertStrictEq(responseA.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assertEquals(responseB.body, encoder.encode('b'));
    assertStrictEq(responseB.headers.get('Content-Type'), 'text/html; charset=utf-8');
});

test('route with array of methods', async () => {
    const server = pogo.server();
    server.route({
        method : ['GET', 'POST'],
        path   : '/hello',
        handler(request) {
            return 'Hi, ' + request.method;
        }
    });
    const getResponse = await server.inject({
        method : 'GET',
        url    : '/hello'
    });
    const postResponse = await server.inject({
        method : 'POST',
        url    : '/hello'
    });
    const putResponse = await server.inject({
        method : 'PUT',
        url    : '/hello'
    });
    assertStrictEq(getResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assertEquals(getResponse.body, encoder.encode('Hi, GET'));
    assertStrictEq(postResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assertEquals(postResponse.body, encoder.encode('Hi, POST'));
    assertStrictEq(putResponse.status, 404);
    assertStrictEq(putResponse.headers.get('Content-Type'), 'application/json; charset=utf-8');
});

test('route with wildcard method', async () => {
    const server = pogo.server();
    server.route({
        method : '*',
        path   : '/hello',
        handler(request) {
            return 'Hi, ' + request.method;
        }
    });
    const getResponse = await server.inject({
        method : 'GET',
        url    : '/hello'
    });
    const postResponse = await server.inject({
        method : 'POST',
        url    : '/hello'
    });
    const putResponse = await server.inject({
        method : 'PUT',
        url    : '/hello'
    });
    assertStrictEq(getResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assertEquals(getResponse.body, encoder.encode('Hi, GET'));
    assertStrictEq(postResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assertEquals(postResponse.body, encoder.encode('Hi, POST'));
    assertStrictEq(putResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assertEquals(putResponse.body, encoder.encode('Hi, PUT'));
});

runTests();
