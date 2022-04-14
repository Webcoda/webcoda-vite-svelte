// Note for lazysizes
// Need to do "mobile size first"
// If you define bgset="imageA sizeA, imageB sizeB", then if the B is loaded first, the A won't load although it matches the size requirement
// If you define bgset="imageA sizeA, imageB sizeB", then if the A is loaded first, B will load if it matches the size requirement

// IMPORTANT:
// Vue instance created on HTML will affect HTML lazysizes images, because Vue manipulates (recreates) the DOM, thus sometimes the images don't
// have the element listener anymore

// To define with media query, do the ones that have mediaquery first, then the ones without
// If you define with media query, it will load based on the set media query
import lazysizes from 'lazysizes'
lazysizes.cfg = lazysizes.cfg || {}
lazysizes.cfg.lazyClass = 'js-lazysizes'
lazysizes.cfg.loadedClass = 'is-lazysizes-loaded'
lazysizes.cfg.loadingClass = 'is-lazysizes-loading'

//page is optimized for fast onload event
lazysizes.cfg.loadMode = 1

lazysizes.cfg.customMedia = {
	'--xxs-portrait': '(max-width: 479px) and (orientation: portrait)',
	'--xxs': '(max-width: 479px)',
	'--xs-portrait': '(max-width: 767px) and (orientation: portrait)',
	'--xs': '(max-width: 767px)',
	'--sm-portrait': '(max-width: 991px) and (orientation: portrait)',
	'--sm': '(max-width: 991px)',
	'--md-portrait': '(max-width: 1179px) and (orientation: portrait)',
	'--md': '(max-width: 1179px)',
	'--lg': '(max-width: 1399px)',
}

import 'lazysizes/plugins/attrchange/ls.attrchange'
import 'lazysizes/plugins/bgset/ls.bgset'
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks'

if (document.querySelector('html').classList.contains('is-IE')) {
	import('lazysizes/plugins/respimg/ls.respimg');
	import('lazysizes/plugins/object-fit/ls.object-fit');

	(async () => {
		const { default: objectFitVideos } = await import('object-fit-videos');
		objectFitVideos();
	})();
}

document.addEventListener('lazyloaded', function(e) {
	$(e.target)
		.closest('picture')
		.addClass(lazysizes.cfg.loadedClass)
})

export default lazysizes;
