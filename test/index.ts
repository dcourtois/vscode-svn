"use strict";

var testRunner = require("vscode/lib/testrunner");

/**
 * Configure Mocha test runner
 */
testRunner.configure({
	ui: "tdd",
	useColors: true,
	reporter: "spec"
});

module.exports = testRunner;
