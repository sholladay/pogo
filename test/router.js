import { assertEquals } from '../dev-dependencies.ts';
import Router from '../lib/router.ts';

const { test } = Deno;

test('new Router() static route', () => {
    const router = new Router({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('new Router() dynamic route', () => {
    const router = new Router({
        method : 'GET',
        path   : '/{username}',
        xyz    : 123
    });

    assertEquals(router.routes, {
        get : {
            dynamic : [{
                method   : 'GET',
                path     : '/{username}',
                segments : ['{username}'],
                xyz      : 123
            }],
            static : new Map()
        }
    });
});

test('new Router() router instance', () => {
    const baseRouter = new Router({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    const extendedRouter = new Router();
    extendedRouter.add(baseRouter);

    assertEquals(extendedRouter.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
    assertEquals(extendedRouter.routes, baseRouter.routes);
});

test('new Router() array of methods', () => {
    const router = new Router({
        method : ['GET', 'POST'],
        path   : '/hello',
        xyz    : 123
    });

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        },
        post : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'POST',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('new Router() array of routes', () => {
    const router = new Router([
        {
            method : 'GET',
            path   : '/hello',
            xyz    : 123
        },
        [{
            method : 'GET',
            path   : '/bye',
            xyz    : 123
        }]
    ]);

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/bye', {
                    method   : 'GET',
                    path     : '/bye',
                    segments : ['bye'],
                    xyz      : 123
                }],
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('new Router() mixed route array with default method', () => {
    const router = new Router([
        '/one',
        { path : '/two' },
        new Router({
            method : 'POST',
            path   : '/three'
        })
    ], { method : 'GET' });

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/one', {
                    method   : 'GET',
                    path     : '/one',
                    segments : ['one']
                }],
                ['/two', {
                    method   : 'GET',
                    path     : '/two',
                    segments : ['two']
                }]
            ])
        },
        post : {
            dynamic : [],
            static  : new Map([
                ['/three', {
                    method   : 'POST',
                    path     : '/three',
                    segments : ['three']
                }]
            ])
        }
    });
});

test('router.add() static route', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('router.add() dynamic route', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/{username}',
        xyz    : 123
    });

    assertEquals(router.routes, {
        get : {
            dynamic : [{
                method   : 'GET',
                path     : '/{username}',
                segments : ['{username}'],
                xyz      : 123
            }],
            static : new Map()
        }
    });
});

test('router.add() router instance', () => {
    const baseRouter = new Router();
    baseRouter.add({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    const extendedRouter = new Router();
    extendedRouter.add(baseRouter);

    assertEquals(extendedRouter.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
    assertEquals(extendedRouter.routes, baseRouter.routes);
});

test('router.add() array of methods', () => {
    const router = new Router();
    router.add({
        method : ['GET', 'POST'],
        path   : '/hello',
        xyz    : 123
    });

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        },
        post : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'POST',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('router.add() array of routes', () => {
    const router = new Router();
    router.add([
        {
            method : 'GET',
            path   : '/hello',
            xyz    : 123
        },
        [{
            method : 'GET',
            path   : '/bye',
            xyz    : 123
        }]
    ]);

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/bye', {
                    method   : 'GET',
                    path     : '/bye',
                    segments : ['bye'],
                    xyz      : 123
                }],
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('router.add() mixed route array with default method', () => {
    const router = new Router();
    router.add([
        '/one',
        { path : '/two' },
        new Router({
            method : 'POST',
            path   : '/three'
        })
    ], { method : 'GET' });

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/one', {
                    method   : 'GET',
                    path     : '/one',
                    segments : ['one']
                }],
                ['/two', {
                    method   : 'GET',
                    path     : '/two',
                    segments : ['two']
                }]
            ])
        },
        post : {
            dynamic : [],
            static  : new Map([
                ['/three', {
                    method   : 'POST',
                    path     : '/three',
                    segments : ['three']
                }]
            ])
        }
    });
});

test('router.get(options)', () => {
    const router = new Router();
    router.get({
        path : '/hello',
        xyz  : 123
    });

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('router.get(path, options)', () => {
    const router = new Router();
    router.get('/hello', { xyz : 123 });

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('router.get(path, handler)', () => {
    const router = new Router();
    const handler = () => {};
    router.get('/hello', handler);

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    handler,
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello']
                }]
            ])
        }
    });
});

test('router.get(options, handler)', () => {
    const router = new Router();
    const handler = () => {};
    router.get({
        path : '/hello',
        xyz  : 123
    }, handler);

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    handler,
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('router.get(path, options, handler)', () => {
    const router = new Router();
    const handler = () => {};
    router.get('/hello', { xyz : 123 }, handler);

    assertEquals(router.routes, {
        get : {
            dynamic : [],
            static  : new Map([
                ['/hello', {
                    handler,
                    method   : 'GET',
                    path     : '/hello',
                    segments : ['hello'],
                    xyz      : 123
                }]
            ])
        }
    });
});

test('router.lookup() static routes', () => {
    const router = new Router({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    assertEquals(router.lookup('GET', '/hello'), {
        method   : 'GET',
        params   : {},
        path     : '/hello',
        segments : ['hello'],
        xyz      : 123
    });
    assertEquals(router.lookup('POST', '/hello'), undefined);
    assertEquals(router.lookup('GET', '/bye'), undefined);
});

test('router.lookup() dynamic routes', () => {
    const router = new Router({
        method : 'GET',
        path   : '/{api}/{userId}',
        xyz    : 123
    });

    assertEquals(router.lookup('GET', '/users/abc'), {
        method : 'GET',
        params : {
            api    : 'users',
            userId : 'abc'
        },
        path     : '/{api}/{userId}',
        segments : ['{api}', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.lookup('POST', '/users/abc'), undefined);
    assertEquals(router.lookup('GET', '/'), undefined);
});

test('router.lookup() wildcard method routes', () => {
    const router = new Router({
        method : '*',
        path   : '/users/{userId}',
        xyz    : 123
    });

    assertEquals(router.lookup('GET', '/users/foo'), {
        method : '*',
        params : {
            userId : 'foo'
        },
        path     : '/users/{userId}',
        segments : ['users', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.lookup('POST', '/users/foo'), {
        method : '*',
        params : {
            userId : 'foo'
        },
        path     : '/users/{userId}',
        segments : ['users', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.lookup('GET', '/users/bar'), {
        method : '*',
        params : {
            userId : 'bar'
        },
        path     : '/users/{userId}',
        segments : ['users', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.lookup('GET', '/users'), undefined);
    assertEquals(router.lookup('GET', '/users/'), undefined);
});

test('router.lookup() not found', () => {
    const router = new Router({
        method : '*',
        path   : '/one',
        xyz    : 123
    });
    assertEquals(router.lookup('GET', '/'), undefined);
    assertEquals(router.lookup('GET', '/two'), undefined);
});
