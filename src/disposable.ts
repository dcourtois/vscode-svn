"use strict";


import { Disposable } from "vscode";


/**
 * List of registered disposables.
 */
const disposables: Disposable[] = [];

/**
 * If the input object is a disposable, register it.
 * Returns the input object without modifying it.
 */
export function addDisposable(disposable: any): any {
	if (disposable.dispose) {
		disposables.push(disposable);
	}
	return disposable;
}

/**
 * Dispose of every registered disposable.
 */
export function dispose() {
	disposables.forEach(disposable => disposable.dispose());
	disposables.length = 0;
}
