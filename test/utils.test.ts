"use strict";

import * as assert from "assert";
import * as utils from "../src/utils";

/**
 * Test the utils.ts module
 */
suite("utils", () => {

	test("execute", async () => {

		assert.equal((await utils.execute("echo", [ "foo" ])).stdout, "foo\n");
		assert.equal((await utils.execute("i_do_not_exists")).stdout, "");

	});

});
