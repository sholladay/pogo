import { React } from '../dependencies.ts';
import { assertEquals, assertStrictEquals } from '../dev-dependencies.ts';
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
    const response = await server.inject('/');
    assertStrictEquals(called, true);
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await response.text(), 'hi');
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
    const response = await server.inject('/');
    assertStrictEquals(called, true);
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await response.text(), '<p>Supports JSX</p>');
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
    const response = await server.inject('/');
    assertStrictEquals(called, true);
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.has('content-type'), false);
    assertStrictEquals(await response.text(), 'Hello');
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
    const response = await server.inject('/');
    assertStrictEquals(called, true);
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await response.text(), JSON.stringify({ foo : 'bar' }));
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
    const responseFalse = await server.inject('/false');
    const responseTrue = await server.inject('/true');
    assertStrictEquals(responseFalse.status, 200);
    assertStrictEquals(responseFalse.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await responseFalse.text(), JSON.stringify(false));
    assertStrictEquals(responseTrue.status, 200);
    assertStrictEquals(responseTrue.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await responseTrue.text(), JSON.stringify(true));
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
    const responseZero = await server.inject('/zero');
    const responseOne = await server.inject('/one');
    assertStrictEquals(responseZero.status, 200);
    assertStrictEquals(responseZero.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await responseZero.text(), JSON.stringify(0));
    assertStrictEquals(responseOne.status, 200);
    assertStrictEquals(responseOne.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await responseOne.text(), JSON.stringify(1));
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.has('content-type'), false);
    assertStrictEquals(await response.text(), '');
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 500);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await response.text(), JSON.stringify({
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
    const response = await server.inject('/users/123');
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await response.text(), JSON.stringify({ userId : '123' }));
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
    const responseA = await server.inject('/a');
    const responseB = await server.inject('/b');
    assertStrictEquals(responseA.status, 200);
    assertStrictEquals(responseA.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await responseA.text(), 'a');
    assertStrictEquals(responseB.status, 200);
    assertStrictEquals(responseB.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await responseB.text(), 'b');
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
    const responseA = await server.inject('/a');
    const responseB = await server.inject('/b');
    assertStrictEquals(responseA.status, 200);
    assertStrictEquals(responseA.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await responseA.text(), 'a');
    assertStrictEquals(responseB.status, 200);
    assertStrictEquals(responseB.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await responseB.text(), 'b');
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
    const getResponse = await server.inject(new Request(new URL('/hello', server.url), { method : 'GET' }));
    const postResponse = await server.inject(new Request(new URL('/hello', server.url), { method : 'POST' }));
    const putResponse = await server.inject(new Request(new URL('/hello', server.url), { method : 'PUT' }));
    assertStrictEquals(getResponse.status, 200);
    assertStrictEquals(getResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await getResponse.text(), 'Hi, GET');
    assertStrictEquals(postResponse.status, 200);
    assertStrictEquals(postResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await postResponse.text(), 'Hi, POST');
    assertStrictEquals(putResponse.status, 404);
    assertStrictEquals(putResponse.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await putResponse.text(), JSON.stringify({
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
    const getResponse = await server.inject(new Request(new URL('/hello', server.url), { method : 'GET' }));
    const postResponse = await server.inject(new Request(new URL('/hello', server.url), { method : 'POST' }));
    const putResponse = await server.inject(new Request(new URL('/hello', server.url), { method : 'PUT' }));
    assertStrictEquals(getResponse.status, 200);
    assertStrictEquals(getResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await getResponse.text(), 'Hi, GET');
    assertStrictEquals(postResponse.status, 200);
    assertStrictEquals(postResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await postResponse.text(), 'Hi, POST');
    assertStrictEquals(putResponse.status, 200);
    assertStrictEquals(putResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await putResponse.text(), 'Hi, PUT');
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 500);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await response.text(), JSON.stringify({
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 500);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await response.text(), JSON.stringify({
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 400);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await response.text(), JSON.stringify({
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 400);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(await response.text(), JSON.stringify({
        error   : 'Bad Request',
        message : 'Crazyyy',
        status  : 400
    }));
});

test('server catchAll option', async () => {
    const server = pogo.server({
        catchAll(request, h) {
            return h.response('Custom fallback, ' + request.method).code(418);
        }
    });
    server.route({
        method : 'GET',
        path   : '/hello',
        handler(request) {
            return 'Hi, ' + request.method;
        }
    });
    const getHelloResponse = await server.inject('/hello');
    const getRootResponse = await server.inject('/');
    const getVoidResponse = await server.inject('/void');
    const postVoidResponse = await server.inject(new Request(new URL('/void', server.url), { method : 'POST' }));
    assertStrictEquals(getHelloResponse.status, 200);
    assertStrictEquals(getHelloResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await getHelloResponse.text(), 'Hi, GET');
    assertStrictEquals(getRootResponse.status, 418);
    assertStrictEquals(getRootResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await getRootResponse.text(), 'Custom fallback, GET');
    assertStrictEquals(getVoidResponse.status, 418);
    assertStrictEquals(getVoidResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await getVoidResponse.text(), 'Custom fallback, GET');
    assertStrictEquals(postVoidResponse.status, 418);
    assertStrictEquals(postVoidResponse.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await postVoidResponse.text(), 'Custom fallback, POST');
});
