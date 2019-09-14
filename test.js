import { assertEquals, assertStrictEq } from 'https://deno.land/std@v0.17.0/testing/asserts.ts';
import { runTests, test } from 'https://deno.land/std@v0.17.0/testing/mod.ts';
import respond from './lib/respond.js';

test('responds with HTML', async () => {
    let called = false;
    const fakeRequest = {
        respond(config) {
            called = true;
            assertEquals(config.body, new TextEncoder().encode('hi'));
            assertStrictEq(config.headers.get('Content-Type'), 'text/html; charset=utf-8');
        }
    };
    await respond(fakeRequest, { body : 'hi' });
    assertStrictEq(called, true);
});

test('responds with JSON', async () => {
    let called = false;
    const fakeRequest = {
        respond(config) {
            called = true;
            assertEquals(config.body, new TextEncoder().encode(JSON.stringify({ foo : 'bar' })));
            assertStrictEq(config.headers.get('Content-Type'), 'application/json; charset=utf-8');
        }
    };
    await respond(fakeRequest, {
        body : {
            foo : 'bar'
        }
    });
    assertStrictEq(called, true);
});

runTests();
