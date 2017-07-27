"use strict";

import * as assert from "assert";
import * as disposable from "../src/disposable";

/**
 * Capture string used to test result of dispose method
 */
let capture: string = "";

/**
 * Dummy dispoable class
 */
class Disposable {
	constructor(private id: string) { }
	public dispose() { capture += this.id; }
}

/**
 * Test the disposable.ts module
 */
suite("disposable", () => {

	test("addDisposable", async () => {

		const foo = disposable.addDisposable(new Disposable("foo"));
		const bar = disposable.addDisposable(new Disposable("bar"));
		const baz = disposable.addDisposable({ id: "baz" });

		// check the function correctly returns the objects
		assert.equal(foo.id, "foo");
		assert.equal(typeof foo.dispose, "function");
		assert.equal(bar.id, "bar");
		assert.equal(typeof bar.dispose, "function");
		assert.equal(baz.id, "baz");
		assert.equal(typeof baz.dispose, "undefined");

	});

	test("dispose", async () => {

		disposable.dispose();

		// check items have been disposed of
		assert.equal(capture, "foobar");

	});

});
