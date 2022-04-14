/**
 * Note: it's required to make the js-megamenu-panel to be invisible (visibility:hidden),
 * so that tabbing on topNavItem doesn't go to the menu inside the panel
*/

import '@/custom_vendors/jquery-accessibleMegaMenu'

export default (el, $el, opts) => {
	const DEFAULT_OPS = {
		/* prefix for generated unique id attributes, which are required
					to indicate aria-owns, aria-controls and aria-labelledby */
		uuidPrefix: 'mainnav-megamenu',

		/* css class used to define the megamenu styling */
		menuClass: 'js-megamenu-menu',

		/* css class for a top-level navigation item in the megamenu */
		topNavItemClass: 'js-megamenu-topnavitem',

		/* css class for a megamenu panel */
		panelClass: 'js-megamenu-panel',

		/* css class for a group of items within a megamenu panel */
		panelGroupClass: 'js-megamenu-panelgroup',

		/* css class for the hover state */
		hoverClass: 'is-hover',

		/* css class for the focus state */
		focusClass: 'is-focus',

		/* css class for the open state */
		openClass: 'is-open',

		// hover intent
		openDelay: 50,
	}

	// Put keyed options here
	const OPTS = {}

	let _opts = {
		...DEFAULT_OPS,
		...opts,
	}

	if (opts.key && OPTS[opts.key]) {
		_opts = {
			..._opts,
			...OPTS[opts.key],
		}
	}

	$el.accessibleMegaMenu(_opts)
}
