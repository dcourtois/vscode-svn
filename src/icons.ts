"use strict";

import * as path from "path";

/**
 * Current path
 */
const rootPath = path.join(path.dirname(__dirname), "..");

/**
 * Icons path
 */
const iconsPath = path.join(rootPath, "resources", "icons");

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
 * Get an icon by name.
 *
 * @param name
 * 		Name of the icon.
 *
 * @param theme
 * 		Theme to get the icon for
 *
 * @returns
 * 		The icon path or null if either name or theme are invalid
 */
export function get(name: string, theme: string): string | undefined {
	const icons = Icons[theme]
	if (icons !== undefined) {
		const icon = icons[name];
		return icon !== undefined ? icon : undefined;
	}
	return undefined;
}
