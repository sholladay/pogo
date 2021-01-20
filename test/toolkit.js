import { assertEquals, assertStrictEquals, assertStringIncludes } from '../dev-dependencies.ts';
import pogo from '../main.ts';

const { test } = Deno;

test('h.response() set JSON body', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response({ hello : 'world' });
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEquals(response.body, JSON.stringify({ hello : 'world' }));
});

test('h.redirect()', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/redirect',
        handler(request, h) {
            return h.redirect('/one');
        }
    });
    server.route({
        method : 'GET',
        path   : '/redirect-no-rewrite',
        handler(request, h) {
            return h.redirect('/two').rewritable(false);
        }
    });
    server.route({
        method : 'GET',
        path   : '/permanent',
        handler(request, h) {
            return h.redirect('/three').permanent();
        }
    });
    server.route({
        method : 'GET',
        path   : '/permanent-no-rewrite',
        handler(request, h) {
            return h.redirect('/four').permanent().rewritable(false);
        }
    });
    const responseOne = await server.inject({
        method : 'GET',
        url    : '/redirect'
    });
    const responseTwo = await server.inject({
        method : 'GET',
        url    : '/redirect-no-rewrite'
    });
    const responseThree = await server.inject({
        method : 'GET',
        url    : '/permanent'
    });
    const responseFour = await server.inject({
        method : 'GET',
        url    : '/permanent-no-rewrite'
    });
    assertStrictEquals(responseOne.status, 302);
    assertStrictEquals(responseOne.headers.get('content-type'), null);
    assertStrictEquals(responseOne.headers.get('location'), '/one');
    assertStrictEquals(responseOne.body, '');
    assertStrictEquals(responseTwo.status, 307);
    assertStrictEquals(responseTwo.headers.get('content-type'), null);
    assertStrictEquals(responseTwo.headers.get('location'), '/two');
    assertStrictEquals(responseTwo.body, '');
    assertStrictEquals(responseThree.status, 301);
    assertStrictEquals(responseThree.headers.get('content-type'), null);
    assertStrictEquals(responseThree.headers.get('location'), '/three');
    assertStrictEquals(responseThree.body, '');
    assertStrictEquals(responseFour.status, 308);
    assertStrictEquals(responseFour.headers.get('content-type'), null);
    assertStrictEquals(responseFour.headers.get('location'), '/four');
    assertStrictEquals(responseFour.body, '');
});

test('h.file()', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/names',
        handler(request, h) {
            return h.file('./test/fixture/names.json');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/names'
    });
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, new TextEncoder().encode('[\n    "Alice",\n    "Bob",\n    "Cara"\n]\n'));
});

test('h.file() outside default confine', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/forbid',
        handler(request, h) {
            return h.file('/etc/hosts');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/forbid'
    });
    assertStrictEquals(response.status, 403);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, JSON.stringify({
        error   : 'Forbidden',
        message : 'Forbidden',
        status  : 403
    }));
});

test('h.directory() serve files', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/dirtest/{file*}',
        handler(request, h) {
            return h.directory('./test/fixture');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/dirtest/names.json'
    });
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, new TextEncoder().encode('[\n    "Alice",\n    "Bob",\n    "Cara"\n]\n'));
});

test('h.directory() forbids listing by default', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/dirtest/{file?}',
        handler(request, h) {
            return h.directory('./test/fixture');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/dirtest/'
    });
    assertStrictEquals(response.status, 403);
    assertStrictEquals(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, JSON.stringify({
        error   : 'Forbidden',
        message : 'Forbidden',
        status  : 403
    }));
});

test('h.directory() listing with relative path', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/dirtest/{file?}',
        handler(request, h) {
            return h.directory('./test/fixture', {listing: true});
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/dirtest/'
    });
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStringIncludes(response.body, '<html>');
    assertStringIncludes(response.body, 'names.json');
});

test('h.directory() listing with partial relative path', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/dirtest/{file?}',
        handler(request, h) {
            return h.directory('test/fixture', {listing: true});
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/dirtest/'
    });
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStringIncludes(response.body, '<html>');
    assertStringIncludes(response.body, 'names.json');
});
