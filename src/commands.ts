"use strict";

import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"
import * as model from "./model"
import * as svn from "./svn"
import * as disposable from "./disposable";


/**
 * Decorator to register commands
 */
function command(id: string): Function {
	return function(target: any, key: string, descriptor: any): any {
		// validation
		if (typeof descriptor.value !== "function") {
			throw new Error("@command decorator only supported on functions");
		}

		// register the command
		CommandCenter.register(id, descriptor.value);

		// return the descriptor unmodified
		return descriptor;
	}
}

/**
 * Stores a command to register
 */
interface Command {
	/**
	 * Id of the command
	 */
	id: string;

	/**
	 * Method to call
	 */
	method: any;
};

/**
 * Command center
 */
export class CommandCenter {

	/**
	 * Model
	 */
	private model: model.Model;

	/**
	 * registered commands
	 */
	private static commands: Command[] = [];

	/**
	 * Constructor
	 */
	constructor(model: model.Model) {
		this.model = model;

		// register our commands
		for (const command of CommandCenter.commands) {
			disposable.add(vscode.commands.registerCommand(command.id, command.method.bind(this)));
		}
	}

	/**
	 * Register a command
	 */
	public static register(id: string, method: Function) {
		CommandCenter.commands.push({ id, method });
	}

	/**
	 * Show the diff between a modified file and the non-modified one.
	 *
	 * @param resource
	 * 		If this command is invoked from the changes resource group
	 * 		onliner, then it's the corresponding resource. But if this
	 * 		command is opened from the editor, it's undefined.
	 */
	@command("svn.diff")
	async diff(resource: model.Resource) {
		// get the modified uri (the current one)
		let modified: vscode.Uri | undefined = undefined;
		if (resource === undefined) {
			if (vscode.window.activeTextEditor) {
				modified = vscode.window.activeTextEditor.document.uri;
			}
		} else {
			modified = resource.resourceUri;
		}

		// check errors
		if (modified === undefined) {
			return;
		}

		// get the original uri
		const original = modified.with({ scheme: "svn" });

		// if the resource was deleted, use an empty file for the diff
		if (resource !== undefined && resource.status === model.Status.DELETED) {
			modified = modified.with({ scheme: "nothing" });
		}

		// open the VSCode diff viewer
		return await vscode.commands.executeCommand< void >(
			"vscode.diff",
			original,
			modified,
			`Diff - ${path.basename(modified.fsPath)}`,
			{ preview: true }
		);
	}

	/**
	 * Stage the given resources for commit.
	 */
	@command("svn.stage")
	async stage(...states: vscode.SourceControlResourceState[]): Promise< void > {
		this.model.stage(states);
	}

	/**
	 * Unstage the given resources.
	 */
	@command("svn.unstage")
	async unstage(...states: vscode.SourceControlResourceState[]): Promise< void > {
		this.model.unstage(states);
	}

	/**
	 * Commit staged files.
	 */
	@command("svn.commit")
	async commit(...states: vscode.SourceControlResourceState[]): Promise< void > {
		for (const state of states) {
			console.log(state.resourceUri);
		}
	}

	/**
	 * Update the repository.
	 */
	@command("svn.update")
	async update(...states: vscode.SourceControlResourceState[]): Promise< void > {
		for (const state of states) {
			console.log(state.resourceUri);
		}
	}

	/**
	 * Revert the given resources.
	 */
	@command("svn.revert")
	async revert(...states: vscode.SourceControlResourceState[]): Promise< void > {
		// build the command line arguments
		const args: string[] = [];
		for (const state of states) {
			args.push(state.resourceUri.fsPath);
		}

		// revert
		svn.revert(args);
	}

}
