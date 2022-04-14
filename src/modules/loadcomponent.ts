export default async (el, $el, opts) => {
	const { default: Component } = await import(`../components/${opts.name}.svelte`)

	const passedProps = {}

	if (opts.propSelectors) {
		opts.propSelectors.forEach(propSelector => {
			const el = document.querySelector(propSelector)
			if (el) {
				passedProps[el.dataset.propkey] = JSON.parse(el.innerHTML)
			}
		})
	}

	new Component({
		// store,
		target: el,
		props: {
			...opts.props,
			...passedProps,
		},
	})
}
