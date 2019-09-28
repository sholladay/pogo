import { assertEquals, assertStrictEq, test } from '../dev-dependencies.js';
import pogo from '../main.js';

const encoder = new TextEncoder();

test('HTML response for string', async () => {
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
    assertStrictEq(called, true);
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(response.body, encoder.encode('hi'));
});

test('JSON response for plain object', async () => {
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
    assertStrictEq(called, true);
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({ foo : 'bar' })));
});

test('JSON response for boolean', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/false',
        handler() {
            return false;
        }
    });
    server.route({
        method : 'GET',
        path   : '/true',
        handler() {
            return true;
        }
    });
    const responseFalse = await server.inject({
        method : 'GET',
        url    : '/false'
    });
    const responseTrue = await server.inject({
        method : 'GET',
        url    : '/true'
    });
    assertStrictEq(responseFalse.status, 200);
    assertStrictEq(responseFalse.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(responseFalse.body, encoder.encode(JSON.stringify(false)));
    assertStrictEq(responseTrue.status, 200);
    assertStrictEq(responseTrue.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(responseTrue.body, encoder.encode(JSON.stringify(true)));
});

test('JSON response for number', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/zero',
        handler() {
            return 0;
        }
    });
    server.route({
        method : 'GET',
        path   : '/one',
        handler() {
            return 1;
        }
    });
    const responseZero = await server.inject({
        method : 'GET',
        url    : '/zero'
    });
    const responseOne = await server.inject({
        method : 'GET',
        url    : '/one'
    });
    assertStrictEq(responseZero.status, 200);
    assertStrictEq(responseZero.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(responseZero.body, encoder.encode(JSON.stringify(0)));
    assertStrictEq(responseOne.status, 200);
    assertStrictEq(responseOne.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(responseOne.body, encoder.encode(JSON.stringify(1)));
});

test('empty response for null', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            return null;
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.has('content-type'), false);
    assertEquals(response.body, encoder.encode(''));
});

test('error response for undefined', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            return undefined;
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 500);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        error   : 'Internal Server Error',
        message : 'An internal error occurred on the server'
    })));
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
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({ userId : '123' })));
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
    assertStrictEq(responseA.status, 200);
    assertStrictEq(responseA.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(responseA.body, encoder.encode('a'));
    assertStrictEq(responseB.status, 200);
    assertStrictEq(responseB.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(responseB.body, encoder.encode('b'));
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
    assertStrictEq(responseA.status, 200);
    assertStrictEq(responseA.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(responseA.body, encoder.encode('a'));
    assertStrictEq(responseB.status, 200);
    assertStrictEq(responseB.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(responseB.body, encoder.encode('b'));
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
    assertStrictEq(getResponse.status, 200);
    assertStrictEq(getResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(getResponse.body, encoder.encode('Hi, GET'));
    assertStrictEq(postResponse.status, 200);
    assertStrictEq(postResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(postResponse.body, encoder.encode('Hi, POST'));
    assertStrictEq(putResponse.status, 404);
    assertStrictEq(putResponse.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(putResponse.body, encoder.encode(JSON.stringify({
        error   : 'Not Found',
        message : 'Page not found'
    })));
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
    assertStrictEq(getResponse.status, 200);
    assertStrictEq(getResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(getResponse.body, encoder.encode('Hi, GET'));
    assertStrictEq(postResponse.status, 200);
    assertStrictEq(postResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(postResponse.body, encoder.encode('Hi, POST'));
    assertStrictEq(putResponse.status, 200);
    assertStrictEq(putResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(putResponse.body, encoder.encode('Hi, PUT'));
});
