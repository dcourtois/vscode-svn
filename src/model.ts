"use strict";


import * as vscode from "vscode";
import * as path from "path";
import * as events from "events";
import * as utils from "./utils";


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
 * Current path
 */
const rootPath = path.join(path.dirname(__dirname), "..");

/**
 * Icons path
 */
const iconsPath = path.join(rootPath, "resources", "icons");


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
 * Icons
 */
const Icons = {
	light: {
		Modified:	path.join(iconsPath, "light", "status-modified.svg"),
		Added:		path.join(iconsPath, "light", "status-added.svg"),
		Deleted:	path.join(iconsPath, "light", "status-deleted.svg"),
		Renamed:	path.join(iconsPath, "light", "status-renamed.svg"),
		Copied:		path.join(iconsPath, "light", "status-copied.svg"),
		Untracked:	path.join(iconsPath, "light", "status-untracked.svg"),
		Ignored:	path.join(iconsPath, "light", "status-ignored.svg"),
		Conflict:	path.join(iconsPath, "light", "status-conflict.svg"),
	},
	dark: {
		Modified:	path.join(iconsPath, "dark", "status-modified.svg"),
		Added:		path.join(iconsPath, "dark", "status-added.svg"),
		Deleted:	path.join(iconsPath, "dark", "status-deleted.svg"),
		Renamed:	path.join(iconsPath, "dark", "status-renamed.svg"),
		Copied:		path.join(iconsPath, "dark", "status-copied.svg"),
		Untracked:	path.join(iconsPath, "dark", "status-untracked.svg"),
		Ignored:	path.join(iconsPath, "dark", "status-ignored.svg"),
		Conflict:	path.join(iconsPath, "dark", "status-conflict.svg"),
	}
};

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
	 * The working tree
	 */
	public workingTree: Resource[] = [];

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
}

/**
 * Helper class to store a source control resource
 */
export class Resource implements vscode.SourceControlResourceState {

	/**
	 * Construct a Resource instance
	 *
	 * @param filePath
	 * 		Path of the file, relative to the workspace
	 */
	constructor(filePath: string, status: Status) {
		this._resourceUri = vscode.Uri.file(path.join(vscode.workspace.rootPath || "", filePath));
		this._status = status;
	}

	/**
	 * The Uri to this resource (its full path)
	 */
	private _resourceUri: vscode.Uri;
	public get resourceUri(): vscode.Uri {
		return this._resourceUri;
	}

	/**
	 * The status of this resource
	 */
	private _status: Status;
	public get status(): Status {
		return this._status;
	}

	/**
	 * The decorations
	 */
	public get decorations(): vscode.SourceControlResourceDecorations {
		return {
			light: { iconPath: Icons.light[StatusToIcon[this._status]] },
			dark: { iconPath: Icons.dark[StatusToIcon[this._status]] },
			strikeThrough: this._status === Status.DELETED
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
