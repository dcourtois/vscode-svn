"use strict";

import * as vscode from "vscode";
import * as svn from "./svn";


/**
 * Implements functionalities related to the status bar.
 */
export class StatusBar implements vscode.Disposable {

	/**
	 * Access to the source control instance
	 */
	private sourceControl: vscode.SourceControl;

	/**
	 * Status bar item used to indicate on which branch we are
	 */
	private branchIndicator: vscode.StatusBarItem;

	/**
	 * Constructor
	 *
	 * @param sourceControl
	 * 		The source control to work with.
	 */
	constructor(sourceControl: vscode.SourceControl) {
		this.sourceControl = sourceControl;

		// setup the branch indicator
		// note: 10000 seems to be the priority to get on the left of the source control's status bar commands
		this.branchIndicator = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10000.0);

		// first update
		this.update();
	}

	/**
	 * Update the status bar
	 */
	public update() {
		svn.info().then((info) => {
			if (info) {
				this.branchIndicator.text = "$(git-branch) " + info.branch;
				this.branchIndicator.show();
			} else {
				this.branchIndicator.hide();
			}
		});
	}

	/**
	 * 'destructor'
	 */
	public dispose() {
		this.branchIndicator.dispose();
	}

}
