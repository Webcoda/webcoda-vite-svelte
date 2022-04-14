export default (el, $el, opts) => {
	$el.on('click', async () => {
		await import(/* webpackPrefetch: true */'bootstrap/js/src/modal')
		$($el.data('target')).modal('show');
	})
}
