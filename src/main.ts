"use strict";

import * as vscode from "vscode";
import * as provider from "./provider";
import * as commands from "./commands";

/**
 * Called once on extension's activation
 */
export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel("Svn");
	context.subscriptions.push(outputChannel);

	const SVNProvider = new provider.Provider(outputChannel);
	context.subscriptions.push(SVNProvider);

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider("svn", SVNProvider));

	context.subscriptions.push(vscode.commands.registerCommand("svn.stage", commands.stage));
	context.subscriptions.push(vscode.commands.registerCommand("svn.diff", commands.diff));

}

/**
 * Called once on extension's deactivation
 */
export function deactivate() {
}
