import {
    assert,
    assertEquals,
    assertStrictEquals
} from '../dev-dependencies.ts';
import Response from '../lib/response.ts';
import * as bang from '../lib/bang.ts';

const { test } = Deno;

test('new Bang() is a 500 error by default', () => {
    const error = new bang.Bang();
    assert(error instanceof Error);
    assert(error instanceof bang.Bang);
    assertStrictEquals(error.message, 'Internal Server Error');
    assert(error.response instanceof Response);
    assertStrictEquals(error.response.status, 500);
    assertEquals(error.response.body, {
        error   : 'Internal Server Error',
        message : 'Internal Server Error',
        status  : 500
    });
});

test('new Bang() with custom message', () => {
    const error = new bang.Bang('some problem');
    assert(error instanceof Error);
    assertStrictEquals(error.message, 'some problem');
    assertStrictEquals(error.response.status, 500);
    assertEquals(error.response.body, {
        error   : 'Internal Server Error',
        message : 'Internal Server Error',
        status  : 500
    });
});

test('new Bang() with custom message and explicit 500 status', () => {
    const error = new bang.Bang('some problem', { status : 500 });
    assert(error instanceof Error);
    assertStrictEquals(error.message, 'some problem');
    assertStrictEquals(error.response.status, 500);
    assertEquals(error.response.body, {
        error   : 'Internal Server Error',
        message : 'Internal Server Error',
        status  : 500
    });
});

test('new Bang() with custom message and 501 status', () => {
    const error = new bang.Bang('some problem', { status : 501 });
    assert(error instanceof Error);
    assertStrictEquals(error.message, 'some problem');
    assertStrictEquals(error.response.status, 501);
    assertEquals(error.response.body, {
        error   : 'Not Implemented',
        message : 'some problem',
        status  : 501
    });
});

test('new Bang() with error', () => {
    const error = new bang.Bang(new Error('some problem'));
    assert(error instanceof Error);
    assertStrictEquals(error.message, 'some problem');
    assertStrictEquals(error.response.status, 500);
    assertEquals(error.response.body, {
        error   : 'Internal Server Error',
        message : 'Internal Server Error',
        status  : 500
    });
});

test('new Bang() with error and 501 status', () => {
    const error = new bang.Bang(new Error('some problem'), { status : 501 });
    assert(error instanceof Error);
    assertStrictEquals(error.message, 'some problem');
    assertStrictEquals(error.response.status, 501);
    assertEquals(error.response.body, {
        error   : 'Not Implemented',
        message : 'some problem',
        status  : 501
    });
});

test('Bang.wrap() returns Bang instance as-is', () => {
    const error = new bang.Bang();
    assertStrictEquals(bang.Bang.wrap(error), error);
});

test('Bang.wrap() constructs new Bang from string', () => {
    const error = bang.Bang.wrap('hello');
    assertEquals(error, new bang.Bang('hello'));
    assertStrictEquals(error.constructor, bang.Bang);
});
