"use strict";

import * as vscode from "vscode"
import * as path from "path"
import * as model from "./model"
import * as utils from "./utils"
import * as fs from "fs"

/**
 * Show the diff between a modified file and the non-modified one.
 */
export async function diff(resource: model.Resource) {
	// get the Uri of the file to diff
	var uri: vscode.Uri | undefined = undefined;
	if (resource === undefined) {
		if (vscode.window.activeTextEditor) {
			uri = vscode.window.activeTextEditor.document.uri;
		}
	} else {
		uri = resource.resourceUri;
	}

	// error check
	if (uri === undefined) {
		return;
	}

	// compute original and modified uri + options
	const original = uri.with({ scheme: "svn" });
	const modified = uri;
	const title = "Diff - " + path.basename(modified.fsPath);
	const options: vscode.TextDocumentShowOptions = {
		preview: true,
	}

	// open the VSCode diff viewer
	return await vscode.commands.executeCommand< void >(
		"vscode.diff",
		original,
		modified,
		title,
		options
	);
}

/**
 * Stage the given resources for commit.
 */
export async function stage(...states: vscode.SourceControlResourceState[]): Promise< void > {
	for (const state of states) {
		console.log(state.resourceUri);
	}
}
