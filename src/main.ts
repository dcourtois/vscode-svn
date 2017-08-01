"use strict";

import { Disposable, ExtensionContext, window, scm, workspace } from "vscode";
import { SvnDiffProvider, SvnContentProvider, NothingContentProvider } from "./provider";
import { Model } from "./model";
import { Controller } from "./controller";
import { CommandCenter } from "./commands";
import * as disposable from "./disposable";
import * as status from "./status";

/**
 * Called once on extension's activation
 */
export function activate(context: ExtensionContext) {
	// our way of communicating with the user
	const outputChannel = disposable.add(window.createOutputChannel("Svn"));

	// create our source control instance
	const sourceControl = disposable.add(scm.createSourceControl("svn", "Svn"));
	sourceControl.quickDiffProvider = disposable.add(new SvnDiffProvider());

	// create our content providers
	disposable.add(workspace.registerTextDocumentContentProvider("svn", new SvnContentProvider()));
	disposable.add(workspace.registerTextDocumentContentProvider("nothing", new NothingContentProvider()));

	// the model
	const model = disposable.add(new Model(outputChannel));

	// the controller
	disposable.add(new Controller(sourceControl, model, outputChannel));

	// the command center
	disposable.add(new CommandCenter(model));

	// status bar
	disposable.add(new status.StatusBar(sourceControl));

	// ensure all our registered disposables will be disposed of
	context.subscriptions.push(new Disposable(() => { disposable.dispose() }));
}

/**
 * Called once on extension's deactivation
 */
export function deactivate() {
}
