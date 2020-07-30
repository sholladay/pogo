import { assertEquals } from '../dev-dependencies.ts';
import Router from '../lib/router.ts';

const { test } = Deno;

test('new Router() static route', () => {
    const router = new Router({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    const record = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('new Router() dynamic route', () => {
    const router = new Router({
        method : 'GET',
        path   : '/{username}',
        xyz    : 123
    });

    const record = {
        method     : 'GET',
        paramNames : ['username'],
        path       : '/{username}',
        segments   : ['', '{username}'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /?', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('new Router() wildcard route', () => {
    const router = new Router({
        method : 'GET',
        path   : '/{file*}',
        xyz    : 123
    });

    const record = {
        method     : 'GET',
        paramNames : ['file'],
        path       : '/{file*}',
        segments   : ['', '{file*}'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /#', record]
        ]),
        list        : [record],
        pathfinders : new Map(),
        wildcards   : [record]
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

    const record = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(extendedRouter.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
    assertEquals(extendedRouter.routes, baseRouter.routes);
});

test('new Router() array of methods', () => {
    const router = new Router({
        method : ['GET', 'POST'],
        path   : '/hello',
        xyz    : 123
    });

    const getHello = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };
    const postHello = {
        method     : 'POST',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', getHello],
            ['POST /hello', postHello]
        ]),
        list        : [getHello, postHello],
        pathfinders : new Map([
            ['/.', [getHello, postHello]]
        ]),
        wildcards : []
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

    const bye = {
        method     : 'GET',
        paramNames : [],
        path       : '/bye',
        segments   : ['', 'bye'],
        xyz        : 123
    };
    const hello = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /bye', bye],
            ['GET /hello', hello]
        ]),
        list        : [bye, hello],
        pathfinders : new Map([
            ['/.', [bye, hello]]
        ]),
        wildcards : []
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

    const one = {
        method     : 'GET',
        paramNames : [],
        path       : '/one',
        segments   : ['', 'one']
    };
    const two = {
        method     : 'GET',
        paramNames : [],
        path       : '/two',
        segments   : ['', 'two']
    };
    const three = {
        method     : 'POST',
        paramNames : [],
        path       : '/three',
        segments   : ['', 'three']
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /one', one],
            ['GET /two', two],
            ['POST /three', three]
        ]),
        list        : [one, three, two],
        pathfinders : new Map([
            ['/.', [one, three, two]]
        ]),
        wildcards : []
    });
});

test('router.add() static route', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    const record = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('router.add() dynamic route', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/{username}',
        xyz    : 123
    });

    const record = {
        method     : 'GET',
        paramNames : ['username'],
        path       : '/{username}',
        segments   : ['', '{username}'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /?', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('router.add() wildcard route', () => {
    const router = new Router();
    router.add({
        method : 'GET',
        path   : '/{file*}',
        xyz    : 123
    });

    const record = {
        method     : 'GET',
        paramNames : ['file'],
        path       : '/{file*}',
        segments   : ['', '{file*}'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /#', record]
        ]),
        list        : [record],
        pathfinders : new Map(),
        wildcards   : [record]
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

    const record = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(extendedRouter.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
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

    const getHello = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };
    const postHello = {
        method     : 'POST',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', getHello],
            ['POST /hello', postHello]
        ]),
        list        : [getHello, postHello],
        pathfinders : new Map([
            ['/.', [getHello, postHello]]
        ]),
        wildcards : []
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

    const bye = {
        method     : 'GET',
        paramNames : [],
        path       : '/bye',
        segments   : ['', 'bye'],
        xyz        : 123
    };
    const hello = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /bye', bye],
            ['GET /hello', hello]
        ]),
        list        : [bye, hello],
        pathfinders : new Map([
            ['/.', [bye, hello]]
        ]),
        wildcards : []
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

    const one = {
        method     : 'GET',
        paramNames : [],
        path       : '/one',
        segments   : ['', 'one']
    };
    const two = {
        method     : 'GET',
        paramNames : [],
        path       : '/two',
        segments   : ['', 'two']
    };
    const three = {
        method     : 'POST',
        paramNames : [],
        path       : '/three',
        segments   : ['', 'three']
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /one', one],
            ['GET /two', two],
            ['POST /three', three]
        ]),
        list        : [one, three, two],
        pathfinders : new Map([
            ['/.', [one, three, two]]
        ]),
        wildcards : []
    });
});

test('router.get(options)', () => {
    const router = new Router();
    router.get({
        path : '/hello',
        xyz  : 123
    });

    const record = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('router.get(path, options)', () => {
    const router = new Router();
    router.get('/hello', { xyz : 123 });

    const record = {
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('router.get(path, handler)', () => {
    const router = new Router();
    const handler = () => {};
    router.get('/hello', handler);

    const record = {
        handler,
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello']
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('router.get(options, handler)', () => {
    const router = new Router();
    const handler = () => {};
    router.get({
        path : '/hello',
        xyz  : 123
    }, handler);

    const record = {
        handler,
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('router.get(path, options, handler)', () => {
    const router = new Router();
    const handler = () => {};
    router.get('/hello', { xyz : 123 }, handler);

    const record = {
        handler,
        method     : 'GET',
        paramNames : [],
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
    };

    assertEquals(router.routes, {
        conflictIds : new Map([
            ['GET /hello', record]
        ]),
        list        : [record],
        pathfinders : new Map([
            ['/.', [record]]
        ]),
        wildcards : []
    });
});

test('router.lookup() static routes', () => {
    const router = new Router({
        method : 'GET',
        path   : '/hello',
        xyz    : 123
    });

    assertEquals(router.lookup('GET', '/hello'), {
        method     : 'GET',
        paramNames : [],
        params     : {},
        path       : '/hello',
        segments   : ['', 'hello'],
        xyz        : 123
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
        method     : 'GET',
        paramNames : ['api', 'userId'],
        params     : {
            api    : 'users',
            userId : 'abc'
        },
        path     : '/{api}/{userId}',
        segments : ['', '{api}', '{userId}'],
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
        method     : '*',
        paramNames : ['userId'],
        params     : {
            userId : 'foo'
        },
        path     : '/users/{userId}',
        segments : ['', 'users', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.lookup('POST', '/users/foo'), {
        method     : '*',
        paramNames : ['userId'],
        params     : {
            userId : 'foo'
        },
        path     : '/users/{userId}',
        segments : ['', 'users', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.lookup('GET', '/users/bar'), {
        method     : '*',
        paramNames : ['userId'],
        params     : {
            userId : 'bar'
        },
        path     : '/users/{userId}',
        segments : ['', 'users', '{userId}'],
        xyz      : 123
    });
    assertEquals(router.lookup('GET', '/users'), undefined);
    assertEquals(router.lookup('GET', '/users/'), undefined);
});

test('router.lookup() not found without catch-all', () => {
    const router = new Router({
        method : '*',
        path   : '/one',
        xyz    : 123
    });
    assertEquals(router.lookup('GET', '/'), undefined);
    assertEquals(router.lookup('GET', '/two'), undefined);
});

test('router.lookup() catch-all', () => {
    const router = new Router({
        method : '*',
        path   : '/{any*}',
        xyz    : 123
    });
    assertEquals(router.lookup('GET', '/'), {
        method     : '*',
        paramNames : ['any'],
        params     : {
            any : ''
        },
        path     : '/{any*}',
        segments : ['', '{any*}'],
        xyz      : 123
    });
    assertEquals(router.lookup('GET', '/foo'), {
        method     : '*',
        paramNames : ['any'],
        params     : {
            any : 'foo'
        },
        path     : '/{any*}',
        segments : ['', '{any*}'],
        xyz      : 123
    });
    assertEquals(router.lookup('GET', '/foo/'), {
        method     : '*',
        paramNames : ['any'],
        params     : {
            any : 'foo/'
        },
        path     : '/{any*}',
        segments : ['', '{any*}'],
        xyz      : 123
    });
    assertEquals(router.lookup('GET', '/foo/bar'), {
        method     : '*',
        paramNames : ['any'],
        params     : {
            any : 'foo/bar'
        },
        path     : '/{any*}',
        segments : ['', '{any*}'],
        xyz      : 123
    });
});
