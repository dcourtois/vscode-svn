"use strict";


import * as vscode from "vscode";
import * as svn from "./svn";


/**
 * vscode.QuickDiffProvider implementation
 */
export class SvnDiffProvider implements vscode.QuickDiffProvider {

	/**
	 * Returns an Uri pointing to the unmodified version of the input Uri.
	 * We just returns the Uri with the scheme "svn", and the registered
	 * SvnContentProvider is used to resolve its content
	 *
	 * @todo
	 * 		Make this async, and check if the resource is source controlled
	 * 		to avoid an error on svn.cat for non-controlled resources.
	 */
	provideOriginalResource(uri: vscode.Uri): vscode.Uri | undefined {
		if (uri.scheme !== "file") {
			return;
		}
		return uri.with({ scheme: "svn" });
	}

}

/**
 * Provides content for Uri scheme "svn"
 */
export class SvnContentProvider implements vscode.TextDocumentContentProvider {

	/**
	 * Provides the original content of the file.
	 */
	async provideTextDocumentContent(uri: vscode.Uri): Promise< string > {
		return svn.cat(uri.fsPath);
	}

}

/**
 * Provides content for Uri scheme "nothing" (always returns an empty string)
 */
export class NothingContentProvider implements vscode.TextDocumentContentProvider {

	/**
	 * Provides an empty string.
	 */
	async provideTextDocumentContent(uri: vscode.Uri): Promise< string > {
		return "";
	}

}
