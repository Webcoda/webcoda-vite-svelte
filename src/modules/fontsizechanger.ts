const FONT_SIZES = [4,8,12,16,20,24,32]
const SESSION_STORAGE_KEY="enabled_fontsize"

export default (el, $el, opts) => {
	const html = document.querySelector('html')
	const getCurrentIndexOfFontSize = () => {
		const fontSize = getComputedStyle(html).fontSize?.replace('px', '')
		const fontSizeInt = parseInt(fontSize)
		const currentIndex = FONT_SIZES.indexOf(fontSizeInt)
		return currentIndex
	}

	const changedFontSize = () => {
		const currentIndex = getCurrentIndexOfFontSize();
		let newIndex

		switch (opts.modifier) {
			case '+':
				newIndex = currentIndex + 1
				break
			case '-':
				newIndex = currentIndex - 1
				break
			default:
				newIndex = 3
				break
		}
		if (newIndex < 0 || newIndex > FONT_SIZES.length) return

		html.style.fontSize = `${FONT_SIZES[newIndex]}px`
		window.sessionStorage[opts.modifier ? 'setItem' : 'removeItem'](SESSION_STORAGE_KEY, FONT_SIZES[newIndex].toString())
	}

	const SAVED_CONFIG = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
	if(SAVED_CONFIG) {
		if(getCurrentIndexOfFontSize() >= 0) {
			html.style.fontSize = SAVED_CONFIG;
		}
	}

	$el.on('click', () => {
		changedFontSize();
	})

}
