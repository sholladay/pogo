import {
    assert,
    assertEquals,
    assertStrictEq
} from "https://deno.land/x/std@61af419bbc5717c2e2552050aacb20ef1b17480b/testing/asserts.ts";
import {
    runTests,
    test
} from "https://deno.land/x/std@61af419bbc5717c2e2552050aacb20ef1b17480b/testing/mod.ts";
import respond from "./lib/respond.js";

test(async function respondsHtml() {
    let called = false;
    const fakeRequest = {
        respond(config) {
            called = true;
            assertEquals(config.body, new TextEncoder().encode("hi"));
            assertStrictEq(
                config.headers.get("Content-Type"),
                "text/html; charset=utf-8"
            );
        }
    };
    await respond(fakeRequest, { body: "hi" });
    assertStrictEq(called, true);
});

test(async function respondsJson() {
    let called = false;
    const fakeRequest = {
        respond(config) {
            called = true;
            assertEquals(
                config.body,
                new TextEncoder().encode(JSON.stringify({ foo: "bar" }))
            );
            assertStrictEq(
                config.headers.get("Content-Type"),
                "application/json; charset=utf-8"
            );
        }
    };
    await respond(fakeRequest, {
        body: {
            foo: "bar"
        }
    });
    assertStrictEq(called, true);
});

runTests();
