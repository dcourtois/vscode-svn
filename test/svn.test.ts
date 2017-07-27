"use strict";

import * as assert from "assert";
import * as svn from "../src/svn";

/**
 * Test the disposable.ts module
 */
suite("svn", () => {

	test("version", async () => {

		const version = await svn.version();

		assert.equal(typeof version, "object");
		if (version) {
			assert.equal(version.major > 0, true);
			assert.equal(typeof version.minor, "number");
			assert.equal(typeof version.patch, "number");
		}

	});

});
