import { assertEquals } from 'https://deno.land/std@v0.18.0/testing/asserts.ts';
import { runTests, test } from 'https://deno.land/std@v0.18.0/testing/mod.ts';
import Router from '../lib/router.js';

test('add() static routes', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/hello'
    }, 'hi');

    assertEquals([...router.routes.get.static.entries()], [
        ['/hello', {
            data     : 'hi',
            path     : '/hello',
            segments : ['hello']
        }]
    ]);
});

test('add() dynamic routes', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/{username}'
    }, 'john');

    assertEquals(router.routes.get.dynamic, [{
        data     : 'john',
        path     : '/{username}',
        segments : ['{username}']
    }]);
});

test('route() static routes', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/hello'
    }, 'hi');

    assertEquals(router.route('GET', '/hello'), {
        data   : 'hi',
        params : {}
    });
    assertEquals(router.route('POST', '/hello'), undefined);
});

test('route() dynamic routes', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/{api}/{userId}'
    }, 'john');

    assertEquals(router.route('GET', '/users/123'), {
        data   : 'john',
        params : {
            api    : 'users',
            userId : '123'
        }
    });
    assertEquals(router.route('POST', '/users/123'), undefined);
});

test('route() wildcard method routes', () => {
    const router = new Router();
    router.add({
        method : '*',
        path   : '/users/{userId}'
    }, 'wild');

    assertEquals(router.route('GET', '/users/123'), {
        data   : 'wild',
        params : {
            userId : '123'
        }
    });
    assertEquals(router.route('POST', '/users/123'), {
        data   : 'wild',
        params : {
            userId : '123'
        }
    });
});

runTests();
