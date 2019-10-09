import { assert, assertEquals, assertStrictEq, test } from '../dev-dependencies.js';
import Response from '../lib/response.js';
import * as bang from '../lib/bang.js';

test('new Bang() is an instance of Error and Bang', () => {
    const error = new bang.Bang();
    assert(error instanceof Error);
    assert(error instanceof bang.Bang);
});

test('new Bang() is a 500 error by default', () => {
    const error = new bang.Bang();
    assert(error.response instanceof Response);
    assertStrictEq(error.response.status, 500);
    assertEquals(error.response.body, {
        error   : 'Internal Server Error',
        message : 'Internal Server Error',
        status  : 500
    });
});
