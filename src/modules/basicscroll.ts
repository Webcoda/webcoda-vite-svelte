import * as basicScroll from 'basicscroll'
export default (el, $el, opts) => {

	const instance = basicScroll.create({
		elem: el,
		...opts,
	})

	instance.start()
}
