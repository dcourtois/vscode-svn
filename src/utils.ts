"use strict";

import { spawn } from "child_process";

/**
 * Contains everything returned after the execution of a child process.
 */
export class Result {
	//! the exit code of the child process
	public code: number;

	//! what it outputed to the standard output
	public stdout: string = "";

	//! what it outputed to the standard error
	public stderr: string = "";

	//! the error string. For instance if the path to the file
	//! to execute was incorrect, etc.
	public error: string = "";
}

/**
 * Asynchronously execute a file.
 *
 * @param program
 * 	Name of the program, or absolute path to it.
 *
 * @param args
 * 	A list of arguments to path to the program.
 *
 * @param options
 * 	The options to call the program with. See documentation of
 * 	Node's child_process module.
 *
 * @returns
 * 	Promise< Result >
 */
export async function execute(program: string, args?: string[], options?: {}): Promise< Result > {
	return new Promise< Result >((resolve) => {
		// data
		var result = new Result();

		// spawn our process
		const process = spawn(program, args, options);

		// watch for data and error
		process.stdout.on("data", (data) => { result.stdout += data.toString(); });
		process.stderr.on("data", (data) => { result.stderr += data.toString(); });
		process.on("error", (data) => { result.error += data.toString(); });

		// on close, resolve whatever the return code
		process.on("close", (code, signal) => {
			result.code = code;
			resolve(result);
		});
	});
}
