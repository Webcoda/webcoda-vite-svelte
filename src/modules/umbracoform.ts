import './umbracoform.scss'

export default (el, $el, opts) => {
	$el.find('form').on('submit', function(e){
		const $form = $(this)
		const validatorData= $form.data('validator')
		if (!validatorData.errorList.length) {
			const submitter = e.originalEvent?.submitter
			const $submitter = $(submitter).addClass('is-loading');
			const $submitButtonsisNotLoading = $form.find('button[type=submit]:not(.is-loading)')
			setTimeout(() => {
				if ($submitter.length) { $submitter.prop('disabled', true) }
				$submitButtonsisNotLoading.prop('disabled', true)
				$submitButtonsisNotLoading.find('.js-umbracoform-spinner').hide()
				$form.addClass('formgroup is-submitting')
			}, 0);
		}
	})
}
