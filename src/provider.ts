"use strict";

import * as vscode from "vscode";
import * as model from "./model";
import * as utils from "./utils";


/**
 * Main class of the extension. Provides everything needed by the SCM framework
 * of VSCode.
 */
export class Provider implements vscode.QuickDiffProvider, vscode.TextDocumentContentProvider {

	/**
	 * Output channel, used to communicate informations to the users.
	 */
	private _outputChannel: vscode.OutputChannel;

	/**
	 * Instance of the SourceControl.
	 */
	private _sourceControl: vscode.SourceControl;

	/**
	 * Changed (modified) resources.
	 */
	private _workingTree: vscode.SourceControlResourceGroup;

	/**
	 * Our model
	 */
	private _model: model.Model;

	/**
	 * Constructor.
	 */
	constructor(private outputChannel: vscode.OutputChannel) {
		this._outputChannel = outputChannel;
		this._sourceControl = vscode.scm.createSourceControl("svn", "Svn");
		this._sourceControl.quickDiffProvider = this;
		this._workingTree = this._sourceControl.createResourceGroup("changes", "Changes");
		this._model = new model.Model(this._outputChannel);

		this._model.on("workingTreeChanged", (modified) => {
			this._workingTree.resourceStates = modified;
		});
	}

	/**
	 * 'destructor'
	 */
	dispose() {
		this._sourceControl.dispose();
		this._workingTree.dispose();
	}

	/**
	 * Implements vscode.QuickDiffProvider
	 */
	provideOriginalResource(uri: vscode.Uri): vscode.Uri | undefined {
		if (uri.scheme !== "file") {
			return;
		}

		return uri.with({ scheme: "svn" });
	}

	/**
	 * Provides the original content of the file.
	 */
	async provideTextDocumentContent(uri: vscode.Uri): Promise< string > {
		if (uri.scheme !== "svn") {
			return;
		}

		const result = await utils.execute("svn", [ "cat", uri.fsPath ]);
		return result.stdout;
	}
}
