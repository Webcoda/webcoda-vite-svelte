import 'slick-carousel'

export default (el, $el, opts) => {
	// custom options. set based on opts.key
	const $parent = opts.closest ? $el.closest(opts.closest) : $el.parent();
	const jsSlickOptions = {}

	const options = {
		rows: 0,
		sliderCaptionSelector: '.o-slider__caption',
		sliderCounterActiveSlideNumberSelector: '.o-slider__counter-index',
		sliderCounterTotalSelector: '.o-slider__counter-total',
		...(opts.key ? jsSlickOptions[opts.key] : {}),
		...opts,
	}

	const genericSlideCounts = $el.children().length

	options.arrows = genericSlideCounts > 1 && options.arrows
	options.dots = genericSlideCounts > 1 && options.dots

	// set initial caption
	$parent.find(options.sliderCaptionSelector).html(
		$el
			.children()
			.eq(0)
			.data('caption'),
	)

	// set count in the slider
	$parent.find(options.sliderCounterTotalSelector).html(genericSlideCounts)

	// added before init
	options.beforeInit && options.beforeInit(options)

	// for timerslider
	if(options.key === 'timerdotsslider') {
		options.customPaging = (slider, i) => {
			return `<button type=button aria-label=${i}>
				<svg class="text-primary-light-900" aria-hidden="true" focusable="false" width="32" height="4" viewBox="0 0 32 4" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect y="0.5" width="32" height="3" fill="#D3D7DB"/>
					<rect y="0.5" width="32" height="3" fill="currentColor" class="timerdotsslider__progressrect"/>
				</svg>
			</button>`
		}
	}


	$el.on('init', (ev, slick) => {
		if (options?.onInit) {
			options.onInit(ev, slick, options)
		}
	})
		.on('breakpoint', (ev, slick) => {
			if (options?.onBreakpoint) {
				options.onBreakpoint(ev, slick, options)
			}
		})
		.on('afterChange', (ev, slick, currentSlide) => {
			// set active slide number
			$parent.find(options.sliderCounterActiveSlideNumberSelector).html(currentSlide + 1)

			// set active caption
			$parent.find(options.sliderCaptionSelector).html(slick.$slides[currentSlide]?.dataset?.caption ?? '')

			if (options?.onAfterChange) {
				options.onAfterChange(ev, slick, currentSlide, options)
			}
		})
		.on('setPosition', (ev, slick) => {
			if (options?.onSetPosition) {
				options.onSetPosition(ev, slick, options)
			}
		})
		.on('beforeChange', (ev, slick, currentSlide, nextSlide) => {
			if (options?.onBeforeChange) {
				options.onBeforeChange(ev, slick, currentSlide, nextSlide, options)
			}
		})
		.slick(options || {})
}
