import { CountUp } from 'countup.js'
export default (el, $el, opts) => {
	const countup = new CountUp(el, opts.end, opts);
	if(!countup.error) {
		countup.start();
	} else {
		console.error(countup.error)
	}
}
