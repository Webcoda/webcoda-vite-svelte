import Headroom from 'headroom.js'

export default (el, $el, opts) => {
	const setStickyHeight = isReset => {
		const $parent = $el.closest('[data-sticky]')
		if (isReset) {
			$parent.data('height', $parent.height())
		}
		$parent.css('height', isReset ? 'auto' : $parent.data('height'))
	}

	const _opts = {
		classes: {
			pinned: 'is-pinned',
			unpinned: 'is-unpinned',
			notTop: 'is-not-top',
			top: 'is-top',
			bottom: 'is-bottom',
			notBottom: 'is-not-bottom',
		},
		onTop() {
			$el.removeClass('has-transition')
			setStickyHeight(true)
		},
		onNotTop() {
			const $this = $el
			setStickyHeight(false)
			setTimeout(() => {
				if (!$this.hasClass('has-transition')) {
					$this.addClass('has-transition')
				}
			}, 0)
		},
		...opts,
		scroller: opts.scroller && typeof opts.scroller === 'string' ? document.querySelector(opts.scroller) : window,
	}

	const headroom = new Headroom(el, _opts)
	headroom.init()
}
