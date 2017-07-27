"use strict";

import { Uri, commands, window, TextDocumentShowOptions, SourceControlResourceState } from "vscode"
import { Model, Status, Resource } from "./model"
import { existsSync } from "fs"
import { basename } from "path"
import { addDisposable } from "./disposable";


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
	private model: Model;

	/**
	 * registered commands
	 */
	private static commands: Command[] = [];

	/**
	 * Constructor
	 */
	constructor(model: Model) {
		this.model = model;

		// register our commands
		for (const command of CommandCenter.commands) {
			addDisposable(commands.registerCommand(command.id, command.method));
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
	async diff(resource: Resource) {
		// get the modified uri (the current one)
		let modified: Uri | undefined = undefined;
		if (resource === undefined) {
			if (window.activeTextEditor) {
				modified = window.activeTextEditor.document.uri;
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
		if (resource !== undefined && resource.status === Status.DELETED) {
			modified = modified.with({ scheme: "nothing" });
		}

		// open the VSCode diff viewer
		return await commands.executeCommand< void >(
			"vscode.diff",
			original,
			modified,
			`Diff - ${basename(modified.fsPath)}`,
			{ preview: true }
		);
	}

	/**
	 * Stage the given resources for commit.
	 */
	@command("svn.stage")
	async stage(...states: SourceControlResourceState[]): Promise< void > {
		for (const state of states) {
			console.log(state.resourceUri);
		}
	}

}
