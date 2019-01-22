import { assert, test } from 'https://deno.land/x/std/testing/mod.ts';
import respond from './lib/respond.js';

test(async function respondsHtml() {
    let called = false;
    const fakeRequest = {
        respond(config) {
            called = true;
            assert.equal(config.body, new TextEncoder().encode('hi'));
            assert.strictEqual(config.headers.get('Content-Type'), 'text/html; charset=utf-8');
        }
    };
    await respond(fakeRequest, { body : 'hi' });
    assert.strictEqual(called, true);
});

test(async function respondsJson() {
    let called = false;
    const fakeRequest = {
        respond(config) {
            called = true;
            assert.equal(config.body, new TextEncoder().encode(JSON.stringify({ foo : 'bar' })));
            assert.strictEqual(config.headers.get('Content-Type'), 'application/json; charset=utf-8');
        }
    };
    await respond(fakeRequest, {
        body : {
            foo : 'bar'
        }
    });
    assert.strictEqual(called, true);
});
