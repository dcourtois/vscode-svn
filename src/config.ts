"use strict";

import * as vscode from "vscode"


/**
 * Get a config value.
 *
 * @param path
 * 		Name of the config item we want.
 *
 * @param defaultValue
 * 		Default value to return if the config item doesn't exist.
 */
export function get(path: string, defaultValue: any): any {
	const config = vscode.workspace.getConfiguration("svn");
	return config.get< string >(path) || defaultValue;
}
