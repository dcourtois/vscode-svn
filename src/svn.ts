"use strict";


import { execute } from "./utils";

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
}

/**
 * Get the unmodified version of the given file
 */
export async function cat(path: string): Promise< string > {
	return (await execute("svn", [ "cat", path ])).stdout;
}

/**
 * Get Svn's version
 */
export async function version(): Promise< Version | void > {
	const version = (await execute("svn", [ "--version" ])).stdout;
	const match = version.match(/version (\d+)\.(\d+)\.(\d+)/g);
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
	const info = (await execute("svn", [ "info" ])).stdout;
	const url = info.match(/^URL: (.+)$/gm);
	const root = info.match(/^Repository Root: (.+)$/gm);
	if (url && root) {
		return {
			url: url[1],
			root: root[1]
		};
	}
}
