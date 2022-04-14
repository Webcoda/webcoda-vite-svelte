// import "vite/modulepreload-polyfill";

/* since the entry is main.ts not index.html, this needs to be included */
import "./styles/main.css";

/**
 * NOTES:
 * This boilerplate uses CDN/external for jQuery/React package. Configured in gulp/webpack.js.
 * This to prevent the needs of jQuery/React from node_modules
 */

///////////////
// Libraries //
///////////////

///////////////////
// Umbraco Forms //
///////////////////
/**
 * 	There are two types umbraco forms: Umbraco Forms and Contour Forms
 * 	The one we're using is the Umbraco Forms.
 * 	The source of below scripts are from SundownersOverland.Web/App_Plugins/UmbracoForms/Assets/themes/default/*.js
 *
 *  Countour Form ones are from SundownersOverland.Web/App_Plugins/UmbracoForms/Assets/*.js
 */
// import './custom_vendors/umbracoforms-dependencies';
// import './custom_vendors/umbracoforms';
// import './custom_vendors/umbracoforms-conditions';

// import 'core-js/es/symbol'
// import 'core-js/es/array/from'
import $ from 'jquery'
// import ssm from 'simplestatemanager';
import feature from 'feature.js'
import AOS from 'aos'

/////////////
// Plugins //
/////////////
import 'bootstrap/js/src/collapse'
import 'bootstrap/js/src/dropdown'
import 'bootstrap/js/src/tab'


////////////
// UTILS //
////////////
import './utils/lazysizes' //this will load lazysizes
import { addInitialPluginsAndHydrate } from './utils/conditioner'
import getScrollbarSize from "./utils/getScrollbarSize";

// STYLE
// import '@@/aos.scss'

window.AOS = AOS

if (!feature.touch) {
	import(/* webpackChunkName: "smoothscroll" */ 'smoothscroll-for-websites').then(
		({ default: SmoothScroll }) => {
			SmoothScroll({ animationTime: 800 })
		},
	)
}

///////////////////////////////
// Dynamic Lazy Load Modules //
///////////////////////////////
addInitialPluginsAndHydrate(document.documentElement)

$(() => {
	//////////////////////
	// Responsive Table //
	//////////////////////
	const $table = $('.o-richtext table:not([class])')
	if ($table.length) {
		$table.wrap('<div class="u-table-responsive">')
	}

	document.documentElement.style.setProperty('--scrollbar-width', getScrollbarSize() + 'px')

	AOS.init({
		once: true,
		duration: 1000,
	})

	$(window).on('load', function() {
		AOS.refresh()
	})

	// for richtext's ol
	$('.o-richtext ol[start]').each(function(){
		const $this = $(this);
		$this.css('counter-reset', `richtext-ol ${parseInt($this.attr('start') || '1') - 1}`)
	})



	/////////
	// SSM //
	/////////
	// ssm.addStates([{
	// 	id: 'xs',
	// 	query: '(max-width: 767px)',
	// 	onEnter: () => {
	// 		console.info('enter <=767px');
	// 	},
	// 	onLeave: () => {
	// 		console.info('leave <=767px');
	// 	},
	// }, {
	// 	id: 'sm',
	// 	query: '(max-width: 991px)',
	// 	onEnter: () => {
	// 		console.info('enter <=991');
	// 	},
	// 	onLeave: () => {
	// 		console.info('leave <=991');
	// 	}
	// }, {
	// 	id: 'md',
	// 	query: '(max-width: 1199px)',
	// 	onEnter: () => {
	// 		console.info('enter <=1199px');
	// 	},
	// 	onLeave: () => {
	// 		console.info('leave <= 1199px');
	// 	}
	// }, {
	// 	id: 'desktop',
	// 	query: '(min-width: 992px)',
	// 	onEnter: () => {
	// 		console.info('enter >= 992px');
	// 	},
	// 	onLeave: () => {
	// 	}
	// } ]);
})


