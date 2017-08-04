"use strict";


import * as vscode from "vscode";
import * as path from "path";
import * as events from "events";
import * as utils from "./utils";
import * as icons from "./icons";

/**
 * Shortcut to the root path
 */
const rootPath: string = vscode.workspace.rootPath || "";

/**
 * File status
 */
export enum Status {
	MODIFIED	= 0,
	ADDED		= 1,
	DELETED		= 2,
	RENAMED		= 3,
	COPIED		= 4,
	UNTRACKED	= 5,
	IGNORED		= 6,
	CONFLICT	= 7
}

/**
 * Map Status to an icon
 */
const StatusToIcon = [
	"Modified",
	"Added",
	"Deleted",
	"Renamed",
	"Copied",
	"Untracked",
	"Ignored",
	"Conflict"
];

/**
 * Maintain a model of the local repository. This uses file watch and the
 * `svn status` command to know what happening on the repository.
 */
export class Model extends events.EventEmitter implements vscode.Disposable {

	/**
	 * File watcher used to sync the model to the physical folder
	 */
	private fileSystemWatcher: vscode.FileSystemWatcher;

	/**
	 * Output channel for this extension
	 */
	private outputChannel: vscode.OutputChannel;

	/**
	 * File creation event
	 */
	private onFileCreated;

	/**
	 * The regular expression used to detect file status.
	 * See `svn help status` for more information.
	 */
	private static statusRegex = /( |A|C|D|I|M|R|X|\?|!|~)( |C|M)( |L)( |\+)( |S|X)( |K)( |K|O|T|B)( |C)(.+)/;

	/**
	 * The working group. This contains the list of files on the local file
	 * system that differ from the current repository version. Files modified,
	 * added, removed, etc.
	 */
	public workingTree: Resource[] = [];

	/**
	 * The staging tree. Contains files that are marked for commiting.
	 */
	public stagingTree: Resource[] = [];

	/**
	 * Constructor
	 */
	constructor(outputChannel: vscode.OutputChannel) {
		// event.EventEmitter constructor
		super();

		// this constructor
		this.outputChannel = outputChannel;
		this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**");

		// todo: in these cases, no need to run status on the whole repository
		this.fileSystemWatcher.onDidChange((uri: vscode.Uri) => { this.updateStatus(); });
		this.fileSystemWatcher.onDidCreate((uri: vscode.Uri) => { this.updateStatus(); });
		this.fileSystemWatcher.onDidDelete((uri: vscode.Uri) => { this.updateStatus(); });

		// first refresh
		this.updateStatus();
	}

	/**
	 * 'destructor'
	 */
	public dispose() {
		this.fileSystemWatcher.dispose();
		this.removeAllListeners();
	}

	/**
	 * Update the model status
	 */
	private async updateStatus() {
		utils.execute("svn", [ "status" ], { "cwd": vscode.workspace.rootPath }).then(
			(result: utils.Result) => {
				// error check
				if (result.stderr.length > 0) {
					this.outputChannel.append(result.stderr);
					return;
				}

				// reset data
				this.workingTree.length = 0;

				// split the output per lines
				const lines = result.stdout.split("\n");

				// scan each line to detect files status
				for (const line of lines) {
					const match = line.match(Model.statusRegex);
					if (match) {
						switch (match[1]) {
							case "M":
								this.workingTree.push(new Resource(match[9], Status.MODIFIED));
								break;

							case "A":
								this.workingTree.push(new Resource(match[9], Status.ADDED));
								break;

							case "?":
								this.workingTree.push(new Resource(match[9], Status.UNTRACKED));
								break;

							case "D":
							case "!":
								this.workingTree.push(new Resource(match[9], Status.DELETED));
								break;
						}
					}
				}

				// notify
				this.emit("workingTreeChanged", this.workingTree);
			},
			(result: utils.Result)  => {
				this.outputChannel.append(result.error);
			}
		);
	}

	/**
	 * Stage the given resources for commit
	 */
	public async stage(states: vscode.SourceControlResourceState[]) {
		// remove resources from the working tree and add to the staging tree
		this.workingTree = this.workingTree.filter((value) => {
			for (const state of states) {
				if (state.resourceUri.toString() === value.resourceUri.toString()) {
					// add to the staging tree
					this.stagingTree.push(new Resource(state.resourceUri, value.status));

					// and filter out
					return false;
				}
			}
			return true;
		});

		// notify
		this.emit("workingTreeChanged", this.workingTree);
		this.emit("stagingTreeChanged", this.stagingTree);
	}

	/**
	 * Unstage the given resources
	 */
	public async unstage(states: vscode.SourceControlResourceState[]) {
		// remove resources from the staging tree and add back to the working tree
		this.stagingTree = this.stagingTree.filter((value) => {
			for (const state of states) {
				if (state.resourceUri.toString() === value.resourceUri.toString()) {
					// add to the staging tree
					this.workingTree.push(new Resource(state.resourceUri, value.status));

					// and filter out
					return false;
				}
			}
			return true;
		});

		// notify
		this.emit("workingTreeChanged", this.workingTree);
		this.emit("stagingTreeChanged", this.stagingTree);
	}
}

/**
 * Helper class to store a source control resource
 */
export class Resource implements vscode.SourceControlResourceState {

	/**
	 * Construct a Resource instance
	 *
	 * @param uri
	 * 		Path of the file, relative to the workspace, or an Uri
	 *
	 * @param status
	 * 		Status of the resource
	 */
	constructor(uri: string | vscode.Uri, status: Status) {
		if (typeof uri === "string") {
			this.resourceUri = vscode.Uri.file(path.join(rootPath, uri));
		} else {
			this.resourceUri = uri;
		}
		this.status = status;
	}

	/**
	 * The Uri to this resource (its full path)
	 */
	public resourceUri: vscode.Uri;

	/**
	 * The status of this resource
	 */
	public status: Status;

	/**
	 * The decorations
	 */
	public get decorations(): vscode.SourceControlResourceDecorations {
		return {
			light: { iconPath: icons.get(StatusToIcon[this.status], "light") },
			dark: { iconPath: icons.get(StatusToIcon[this.status], "dark") },
			strikeThrough: this.status === Status.DELETED
		};
	}

	/**
	 * Command invoked when the resource is clicked on in the source control tab.
	 */
	public get command() {
		return {
			command: "svn.diff",
			title: "Svn: Diff",
			arguments: [ this ]
		};
	}
}
