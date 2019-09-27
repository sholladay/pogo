import { assertEquals, assertStrictEq } from 'https://deno.land/std@v0.18.0/testing/asserts.ts';
import { runTests, test } from 'https://deno.land/std@v0.18.0/testing/mod.ts';
import Response from '../lib/response.js';
import Server from '../lib/server.js';
import pogo from '../main.js';

const encoder = new TextEncoder();

test('request.headers is a Headers instance', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isHeadersInstance : request.headers instanceof Headers,
                hostHeader        : request.headers.get('host'),
                type              : typeof request.headers
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isHeadersInstance : true,
        hostHeader        : 'localhost',
        type              : 'object'
    })));
});

test('request.host is a hostname and port', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isSameAsHeader : request.host === request.headers.get('host'),
                isSameAsUrl    : request.host === request.url.host,
                type           : typeof request.host,
                value          : request.host
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isSameAsHeader : true,
        isSameAsUrl    : true,
        type           : 'string',
        value          : 'localhost'
    })));
});

test('request.hostname is a domain or IP address', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isInHostHeader : request.hostname === request.headers.get('host').split(':')[0],
                isSameAsUrl    : request.hostname === request.url.hostname,
                type           : typeof request.hostname,
                value          : request.hostname
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isInHostHeader : true,
        isSameAsUrl    : true,
        type           : 'string',
        value          : 'localhost'
    })));
});

test('request.href is a full URL string', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isSameAsUrl : request.href === request.url.href,
                type        : typeof request.href,
                value       : request.href
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isSameAsUrl : true,
        type        : 'string',
        value       : 'http://localhost/'
    })));
});

test('request.method is an HTTP method', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isGet : request.method === 'GET',
                type  : typeof request.method
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isGet : true,
        type  : 'string'
    })));
});

test('request.origin is a protocol and host', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isSameAsUrl : request.origin === request.url.origin,
                type        : typeof request.origin,
                value       : request.origin
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isSameAsUrl : true,
        type        : 'string',
        value       : 'http://localhost'
    })));
});

test('request.params contains path variables', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/users/{userId}',
        handler(request) {
            return {
                type   : typeof request.params,
                userId : request.params.userId,
                value  : request.params
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/users/123'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        type  : 'object',
        userId : '123',
        value  : {
            userId : '123'
        }
    })));
});

test('request.path is a URL path string', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isSameAsUrl : request.path === request.url.pathname,
                type        : typeof request.path,
                value       : request.path
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/?query'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isSameAsUrl : true,
        type        : 'string',
        value       : '/'
    })));
});

test('request.raw is the original request', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isGet : request.raw.method === 'GET',
                type  : typeof request.raw
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isGet : true,
        type  : 'object'
    })));
});

test('request.response is a Response instance', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isResponseInstance : request.response instanceof Response,
                type               : typeof request.response
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isResponseInstance : true,
        type               : 'object'
    })));
});

test('request.route is a router record', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                hasHandler : typeof request.route.data === 'function',
                params     : request.route.params,
                type       : typeof request.route
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        hasHandler : true,
        params     : {},
        type       : 'object'
    })));
});

test('request.search is a URL search string', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isSameAsUrl : request.search === request.url.search,
                type        : typeof request.search,
                value       : request.search
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/?query'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isSameAsUrl : true,
        type        : 'string',
        value       : '?query'
    })));
});

test('request.searchParams is a URLSearchParams instance', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                asString         : request.searchParams.toString(),
                isSameAsUrl      : request.searchParams === request.url.searchParams,
                isParamsInstance : request.searchParams instanceof URLSearchParams,
                type             : typeof request.searchParams
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/?query'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        asString         : 'query=',
        isSameAsUrl      : true,
        isParamsInstance : true,
        type             : 'object'
    })));
});

test('request.server is a Server instance', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                isServerInstance : request.server instanceof Server,
                type             : typeof request.server
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        isServerInstance : true,
        type             : 'object'
    })));
});

test('request.url is a URL instance', async () => {
    const server = pogo.server();
    server.route({
        method : 'GET',
        path   : '/',
        handler(request) {
            return {
                asString      : request.url,
                href          : request.url.href,
                isUrlInstance : request.url instanceof URL,
                type          : typeof request.url
            };
        }
    });
    const response = await server.inject({
        method : 'GET',
        url    : '/'
    });
    assertStrictEq(response.status, 200);
    assertStrictEq(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assertEquals(response.body, encoder.encode(JSON.stringify({
        asString      : 'http://localhost/',
        href          : 'http://localhost/',
        isUrlInstance : true,
        type          : 'object'
    })));
});

runTests();
