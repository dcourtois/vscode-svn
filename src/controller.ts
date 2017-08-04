"use strict";


import { Disposable, SourceControlResourceGroup, SourceControl, OutputChannel } from "vscode";
import { Model } from "./model";


/**
 * Controller binding everything together
 */
export class Controller implements Disposable {

	/**
	 * Changed (modified) resources.
	 */
	private workingTree: SourceControlResourceGroup;

	/**
	 * Staged resources.
	 */
	private stagingTree: SourceControlResourceGroup;

	/**
	 * Constructor
	 */
	constructor(private sourceControl: SourceControl, private model: Model, private outputChannel: OutputChannel) {
		// create our resource groups
		this.workingTree = this.sourceControl.createResourceGroup("1_changes", "Changes");
		this.workingTree.hideWhenEmpty = true;
		this.stagingTree = this.sourceControl.createResourceGroup("0_staged", "Staged Changes");
		this.stagingTree.hideWhenEmpty = true;

		// bind the model changes
		this.model.on("workingTreeChanged", (modified) => { this.workingTree.resourceStates = modified; });
		this.model.on("stagingTreeChanged", (modified) => { this.stagingTree.resourceStates = modified; });
	}

	/**
	 * 'destructor'
	 */
	public dispose() {
		this.workingTree.dispose();
		this.stagingTree.dispose();
	}

}