export default (el, $el, opts) => {
	const $active = $el.find('.active')
	if($active.length) {
		$el[0].scrollLeft = $active[0].offsetLeft
	}
}
