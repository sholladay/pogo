import { assertStrictEquals } from '../dev-dependencies.ts';
import pogo from '../main.ts';

const { test } = Deno;

test('response.code() set status code', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('hi').code(418);
        }
    });
    const response = await server.inject('/');
    assertStrictEquals(response.status, 418);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(await response.text(), 'hi');
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
    const responseNoLocation = await server.inject('/no-location');
    const responseWithLocation = await server.inject('/with-location');
    assertStrictEquals(responseNoLocation.status, 201);
    assertStrictEquals(responseNoLocation.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(responseNoLocation.headers.has('location'), false);
    assertStrictEquals(await responseNoLocation.text(), 'one');
    assertStrictEquals(responseWithLocation.status, 201);
    assertStrictEquals(responseWithLocation.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(responseWithLocation.headers.get('location'), '/yay');
    assertStrictEquals(await responseWithLocation.text(), 'two');
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(response.headers.get('x-dog'), 'woof');
    assertStrictEquals(await response.text(), 'hi');
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assertStrictEquals(response.headers.get('location'), '/over-the-rainbow');
    assertStrictEquals(await response.text(), 'hi');
});

test('response.state() set cookie', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('').state('sesh', 'nomnomnom');
        }
    });
    const response = await server.inject('/');
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/plain; charset=utf-8');
    assertStrictEquals(response.headers.get('set-cookie'), 'sesh=nomnomnom; Secure; HttpOnly; SameSite=Strict');
    assertStrictEquals(await response.text(), '');
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
    const response = await server.inject('/');
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'weird/type');
    assertStrictEquals(await response.text(), JSON.stringify({ hello : 'world' }));
});

test('response.unstate() clear cookie', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request, h) {
            return h.response('').unstate('mwahaha');
        }
    });
    const response = await server.inject('/');
    assertStrictEquals(response.status, 200);
    assertStrictEquals(response.headers.get('content-type'), 'text/plain; charset=utf-8');
    assertStrictEquals(response.headers.get('set-cookie'), 'mwahaha=; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    assertStrictEquals(await response.text(), '');
});
