"use strict";


import * as utils from "./utils";
import * as vscode from "vscode";

/**
 * Current root path
 */
const rootPath: string = vscode.workspace.rootPath || ".";

/**
 * Version
 */
export interface Version {
	major: number;
	minor: number;
	patch: number;
}

/**
 * Info
 */
export interface Info {
	url: string;
	root: string;
	branch: string;
}

/**
 * Check if the given file is source controlled
 */
export async function isControlled(path: string): Promise< boolean > {
	const result = (await utils.execute("svn", [ "status", path ], { cwd: rootPath })).stdout;
	return result.length > 0 ? result.charAt(0) === "?" : false;
}

/**
 * Get the unmodified version of the given file
 */
export async function cat(path: string): Promise< string > {
	return (await utils.execute("svn", [ "cat", path ], { cwd: rootPath })).stdout;
}

/**
 * Get Svn's version
 */
export async function version(): Promise< Version | void > {
	const version = (await utils.execute("svn", [ "--version" ])).stdout;
	const match = version.match(/version (\d+)\.(\d+)\.(\d+)/);
	if (match !== null) {
		return {
			major: parseInt(match[1]),
			minor: parseInt(match[2]),
			patch: parseInt(match[3])
		};
	}
}

/**
 * Get Svn's info
 */
export async function info(): Promise< Info | void > {
	const info = (await utils.execute("svn", [ "info" ], { cwd: rootPath })).stdout;
	const url = info.match(/^URL: (.+)$/m);
	const root = info.match(/^Repository Root: (.+)$/m);
	if (url && root) {
		let branch = url[1].replace(root[1], "");
		if (branch.startsWith("/") === true) {
			branch = branch.substring(1);
		}
		return {
			url: url[1],
			root: root[1],
			branch: branch
		};
	}
}

/**
 * Revert things.
 *
 * @param files
 * 		List of path to revert. If undefined, will revert the whole repository.
 */
export async function revert(files: string[] | undefined) {
	utils.execute("svn", [ "revert" ].concat(files || []), { cwd: rootPath });
}
