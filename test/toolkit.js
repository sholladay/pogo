import { assertEquals, assertStrictEq } from 'https://deno.land/std@v0.17.0/testing/asserts.ts';
import { runTests, test } from 'https://deno.land/std@v0.17.0/testing/mod.ts';
import pogo from '../main.js';

const encoder = new TextEncoder();

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
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({ hello : 'world' })));
});

test('response.code() set status code', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('hi').code(418);
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 418);
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertEquals(response.body, encoder.encode('hi'));
});

test('response.created() set status and location', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/no-location',
        handler(request, h) {
            return h.response('one').created();
        }
    });
    server.route({
        method : 'GET',
        path   : '/with-location',
        handler(request, h) {
            return h.response('two').created('/yay');
        }
    });
    const responseNoLocation = await server.inject({
        method : 'GET',
        url    : '/no-location'
    });
    const responseWithLocation = await server.inject({
        method : 'GET',
        url    : '/with-location'
    });
    assertStrictEq(responseNoLocation.status, 201);
    assertStrictEq(responseNoLocation.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(responseNoLocation.headers.has('location'), false);
    assertEquals(responseNoLocation.body, encoder.encode('one'));
    assertStrictEq(responseWithLocation.status, 201);
    assertStrictEq(responseWithLocation.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(responseWithLocation.headers.get('location'), '/yay');
    assertEquals(responseWithLocation.body, encoder.encode('two'));
});

test('response.header() set custom header', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('hi').header('x-dog', 'woof');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(response.headers.get('x-dog'), 'woof');
    assertEquals(response.body, encoder.encode('hi'));
});

test('response.location() set location header', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('hi').location('/over-the-rainbow');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEq(response.headers.get('location'), '/over-the-rainbow');
    assertEquals(response.body, encoder.encode('hi'));
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
    assertEquals(responseOne.body, encoder.encode(''));
    assertStrictEq(responseTwo.status, 307);
    assertStrictEq(responseTwo.headers.get('content-type'), null);
    assertStrictEq(responseTwo.headers.get('location'), '/two');
    assertEquals(responseTwo.body, encoder.encode(''));
    assertStrictEq(responseThree.status, 301);
    assertStrictEq(responseThree.headers.get('content-type'), null);
    assertStrictEq(responseThree.headers.get('location'), '/three');
    assertEquals(responseThree.body, encoder.encode(''));
    assertStrictEq(responseFour.status, 308);
    assertStrictEq(responseFour.headers.get('content-type'), null);
    assertStrictEq(responseFour.headers.get('location'), '/four');
    assertEquals(responseFour.body, encoder.encode(''));
});

test('response.type() override default content-type handling', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response({ hello : 'world' }).type('weird/type');
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'weird/type');
    assertEquals(response.body, encoder.encode(JSON.stringify({ hello : 'world' })));
});

runTests();
