import Cookie from 'js-cookie'

// Note, by default, the alertbar should be hidden (style="display: none")
// data-module-options="{ cookieKey: 'alertbarDisabled', closeSelector: '#alertbar-close' }"
export default (el, $el, opts) => {
    const cookie = Cookie.get(opts.cookieKey);
    if(!cookie) {
        el.style.display = ''
		document.documentElement.style.setProperty('--alertbar-height', el.offsetHeight + 'px')
    }

    if(opts.closeSelector) {
		$(opts.closeSelector).on('click', () => {
			Cookie.set(opts.cookieKey, '1')
			el.style.display = 'none'
			document.documentElement.style.setProperty('--alertbar-height', '0px')
		})
    }
}
