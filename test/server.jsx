import { React } from '../dependencies.ts';
import { assertEquals, assertStrictEq } from '../dev-dependencies.ts';
import * as bang from '../lib/bang.ts';
import pogo from '../main.ts';

const { test } = Deno;

test('server.route() HTML response for string', async () => {
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
    assertStrictEq(response.body, 'hi');
});

test('server.route() HTML response for JSX', async () => {
    const server = pogo.server();
    let called = false;
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            called = true;
            return <p>Supports JSX</p>;
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(called, true);
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(response.body, '<p>Supports JSX</p>');
});

test('server.route() returns Uint8Array', async () => {
    const server = pogo.server();
    let called = false;
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            called = true;
            return new TextEncoder().encode('Hello');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(called, true);
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.has('content-type'), false);
    assertEquals(response.body, new TextEncoder().encode('Hello'));
});

test('server.route() JSON response for plain object', async () => {
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
    assertStrictEq(response.body, JSON.stringify({ foo : 'bar' }));
});

test('server.route() JSON response for boolean', async () => {
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
    assertStrictEq(responseFalse.body, JSON.stringify(false));
    assertStrictEq(responseTrue.status, 200);
    assertStrictEq(responseTrue.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEq(responseTrue.body, JSON.stringify(true));
});

test('server.route() JSON response for number', async () => {
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
    assertStrictEq(responseZero.body, JSON.stringify(0));
    assertStrictEq(responseOne.status, 200);
    assertStrictEq(responseOne.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEq(responseOne.body, JSON.stringify(1));
});

test('server.route() empty response for null', async () => {
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
    assertStrictEq(response.body, '');
});

test('server.route() error response for undefined', async () => {
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
    assertStrictEq(response.body, JSON.stringify({
        error   : 'Internal Server Error',
        message : 'Internal Server Error',
        status  : 500
    }));
});

test('server.route() with dynamic path', async () => {
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
    assertStrictEq(response.body, JSON.stringify({ userId : '123' }));
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
    assertStrictEq(responseA.body, 'a');
    assertStrictEq(responseB.status, 200);
    assertStrictEq(responseB.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(responseB.body, 'b');
});

test('server.route() array of routes', async () => {
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
    assertStrictEq(responseA.body, 'a');
    assertStrictEq(responseB.status, 200);
    assertStrictEq(responseB.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(responseB.body, 'b');
});

test('server.route() array of methods', async () => {
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
    assertStrictEq(getResponse.body, 'Hi, GET');
    assertStrictEq(postResponse.status, 200);
    assertStrictEq(postResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(postResponse.body, 'Hi, POST');
    assertStrictEq(putResponse.status, 404);
    assertStrictEq(putResponse.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEq(putResponse.body, JSON.stringify({
        error   : 'Not Found',
        message : 'Not Found',
        status  : 404
    }));
});

test('server.route() wildcard method', async () => {
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
    assertStrictEq(getResponse.body, 'Hi, GET');
    assertStrictEq(postResponse.status, 200);
    assertStrictEq(postResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(postResponse.body, 'Hi, POST');
    assertStrictEq(putResponse.status, 200);
    assertStrictEq(putResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(putResponse.body, 'Hi, PUT');
});

test('server.route() handler returns Error', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            return new Error('Crazyyy');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 500);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEq(response.body, JSON.stringify({
        error   : 'Internal Server Error',
        message : 'Internal Server Error',
        status  : 500
    }));
});

test('server.route() handler throws Error', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            throw new Error('Crazyyy');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 500);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEq(response.body, JSON.stringify({
        error   : 'Internal Server Error',
        message : 'Internal Server Error',
        status  : 500
    }));
});

test('server.route() handler returns bang.badRequest()', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            return bang.badRequest('Crazyyy');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 400);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEq(response.body, JSON.stringify({
        error   : 'Bad Request',
        message : 'Crazyyy',
        status  : 400
    }));
});

test('server.route() handler throws bang.badRequest()', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler() {
            throw bang.badRequest('Crazyyy');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 400);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEq(response.body, JSON.stringify({
        error   : 'Bad Request',
        message : 'Crazyyy',
        status  : 400
    }));
});
