import { assertEquals, assertStrictEq, assertStringContains } from '../dev-dependencies.ts';
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
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertStrictEq(response.body, JSON.stringify({ hello : 'world' }));
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
    assertStrictEq(responseOne.status, 302);
    assertStrictEq(responseOne.headers.get('content-type'), null);
    assertStrictEq(responseOne.headers.get('location'), '/one');
    assertStrictEq(responseOne.body, '');
    assertStrictEq(responseTwo.status, 307);
    assertStrictEq(responseTwo.headers.get('content-type'), null);
    assertStrictEq(responseTwo.headers.get('location'), '/two');
    assertStrictEq(responseTwo.body, '');
    assertStrictEq(responseThree.status, 301);
    assertStrictEq(responseThree.headers.get('content-type'), null);
    assertStrictEq(responseThree.headers.get('location'), '/three');
    assertStrictEq(responseThree.body, '');
    assertStrictEq(responseFour.status, 308);
    assertStrictEq(responseFour.headers.get('content-type'), null);
    assertStrictEq(responseFour.headers.get('location'), '/four');
    assertStrictEq(responseFour.body, '');
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
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
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
    assertStrictEq(response.status, 403);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
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
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, new TextEncoder().encode('[\n    "Alice",\n    "Bob",\n    "Cara"\n]\n'));
});

test('h.directory() listing with relative path', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/dirtest/{dirname?}',
        handler(request, h) {
            return h.directory('./test/fixture', {listing: true});
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/dirtest/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStringContains(response.body, '<html>');
    assertStringContains(response.body, 'names.json');
});

test('h.directory() listing with partial relative path', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/dirtest/{dirname?}',
        handler(request, h) {
            return h.directory('test/fixture', {listing: true});
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/dirtest/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStringContains(response.body, '<html>');
    assertStringContains(response.body, 'names.json');
});

test('h.directory() forbids listing by default', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/dirtest/{dirname?}',
        handler(request, h) {
            return h.directory('./test/fixture');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/dirtest/'
    });
    assertStrictEq(response.status, 403);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, JSON.stringify({
        error   : 'Forbidden',
        message : 'Forbidden',
        status  : 403
    }));
});