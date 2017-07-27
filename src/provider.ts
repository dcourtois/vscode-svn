"use strict";


import { Uri, QuickDiffProvider, TextDocumentContentProvider } from "vscode";
import * as svn from "./svn";


/**
 * vscode.QuickDiffProvider implementation
 */
export class SvnDiffProvider implements QuickDiffProvider {

	/**
	 * Returns an Uri pointing to the unmodified version of the input Uri.
	 * We just returns the Uri with the scheme "svn", and the registered
	 * SvnContentProvider is used to resolve its content
	 */
	provideOriginalResource(uri: Uri): Uri | undefined {
		if (uri.scheme !== "file") {
			return;
		}

		return uri.with({ scheme: "svn" });
	}

}

/**
 * Provides content for Uri scheme "svn"
 */
export class SvnContentProvider implements TextDocumentContentProvider {

	/**
	 * Provides the original content of the file.
	 */
	async provideTextDocumentContent(uri: Uri): Promise< string > {
		return svn.cat(uri.fsPath);
	}

}

/**
 * Provides content for Uri scheme "nothing" (always returns an empty string)
 */
export class NothingContentProvider implements TextDocumentContentProvider {

	/**
	 * Provides an empty string.
	 */
	async provideTextDocumentContent(uri: Uri): Promise< string > {
		return "";
	}

}
