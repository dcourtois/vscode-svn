"use strict";

import { Disposable, ExtensionContext, window, scm, workspace } from "vscode";
import { SvnDiffProvider, SvnContentProvider, NothingContentProvider } from "./provider";
import { Model } from "./model";
import { Controller } from "./controller";
import { CommandCenter } from "./commands";
import { addDisposable, dispose } from "./disposable";

/**
 * Called once on extension's activation
 */
export function activate(context: ExtensionContext) {
	// our way of communicating with the user
	const outputChannel = addDisposable(window.createOutputChannel("Svn"));

	// create our source control instance
	const sourceControl = addDisposable(scm.createSourceControl("svn", "Svn"));
	sourceControl.quickDiffProvider = addDisposable(new SvnDiffProvider());

	// create our content providers
	addDisposable(workspace.registerTextDocumentContentProvider("svn", new SvnContentProvider()));
	addDisposable(workspace.registerTextDocumentContentProvider("nothing", new NothingContentProvider()));

	// the model
	const model = addDisposable(new Model(outputChannel));

	// the controller
	addDisposable(new Controller(sourceControl, model, outputChannel));

	// the command center
	addDisposable(new CommandCenter(model));

	// ensure all our registered disposables will be disposed of
	context.subscriptions.push(new Disposable(() => { dispose() }));
}

/**
 * Called once on extension's deactivation
 */
export function deactivate() {
}
