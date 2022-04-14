const copyToClipboard = (text) => {
	const textArea = document.createElement('textarea');
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.select();
	let success, error;

	try {
		success = document.execCommand('copy');
	}
	catch (err) {
		success = false;
		error = err;
	}
	document.body.removeChild(textArea);

	return  {
		success,
		error,
	}
};

export default (el, $el, opts) => {
	// copy target value to clipboard
	const $target = $(opts.target);
	$el.on(opts.on || 'click', (e) => {
		e.preventDefault()
		const { success, error } = copyToClipboard($target.val());
		if(success) {
			alert('Link copied')
		}
	});
};
