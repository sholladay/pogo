import { assertEquals, test } from '../dev-dependencies.js';
import Router from '../lib/router.js';

test('add() static routes', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    assertEquals([...router.routes.get.static.entries()], [
        ['/hello', {
            method   : 'GET',
            path     : '/hello',
            segments : ['hello'],
            xyz      : 123
        }]
    ]);
});

test('add() dynamic routes', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/{username}',
        xyz    : 123
    });

    assertEquals(router.routes.get.dynamic, [{
        method   : 'GET',
        path     : '/{username}',
        segments : ['{username}'],
        xyz      : 123
    }]);
});

test('route() static routes', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    assertEquals(router.route('GET', '/hello'), {
        method   : 'GET',
        params   : {},
        path     : '/hello',
        segments : ['hello'],
        xyz      : 123
    });
    assertEquals(router.route('POST', '/hello'), undefined);
});

test('route() dynamic routes', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/{api}/{userId}',
        xyz    : 123
    });

    assertEquals(router.route('GET', '/users/abc'), {
        method : 'GET',
        params : {
            api    : 'users',
            userId : 'abc'
        },
        path     : '/{api}/{userId}',
        segments : ['{api}', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.route('POST', '/users/abc'), undefined);
});

test('route() wildcard method routes', () => {
    const router = new Router();
    router.add({
        method : '*',
        path   : '/users/{userId}',
        xyz    : 123
    });

    assertEquals(router.route('GET', '/users/abc'), {
        method : '*',
        params : {
            userId : 'abc'
        },
        path     : '/users/{userId}',
        segments : ['users', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.route('POST', '/users/abc'), {
        method : '*',
        params : {
            userId : 'abc'
        },
        path     : '/users/{userId}',
        segments : ['users', '{userId}'],
        xyz      : 123
    });
});
