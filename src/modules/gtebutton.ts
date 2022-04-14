export default async (el, $el, opts) => {
	const changeBtnVal = ($combo, val) => {
		const value = $combo.find(`option[value="${val}"]`).text()
		const $btn = $(opts.selectorBtnText)
		$btn.text(val ? value : 'English')
	}

	const checkFn = () => {
		const $combo = $el.find('.goog-te-combo')
		if($combo.length) {
			const $option = $combo.find('option:selected');
			if($option.length) {
				$combo.on('change', (e) => {
					changeBtnVal($combo, e.target.value)
				})
				setTimeout(() => {
					changeBtnVal($combo, $combo.val())

					// $(opts.cloneSelector).html($('#gte').clone(true, true))
				}, 1000)
				return
			}
		}
		requestAnimationFrame(checkFn)
	}
	requestAnimationFrame(checkFn)
}
