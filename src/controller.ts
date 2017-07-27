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
	 * Constructor
	 */
	constructor(private sourceControl: SourceControl, private model: Model, private outputChannel: OutputChannel) {
		// create our resource groups
		this.workingTree = this.sourceControl.createResourceGroup("changes", "Changes");

		// bind the model changes
		this.model.on("workingTreeChanged", (modified) => {
			this.workingTree.resourceStates = modified;
		});
	}

	/**
	 * 'destructor'
	 */
	public dispose() {
		this.workingTree.dispose();
	}

}