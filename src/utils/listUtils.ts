import wurl from 'wurl'

export const changeParams = strParams => {
	return history.pushState('', '', `${window.location.pathname}${strParams ? `?${strParams}` : ''}`)
}

export const paramsObjectToStr = param => {
	return Object.keys(param)
		.filter(k => !!param[k])
		.map(k => `${k}=${param[k]}`)
		.join('&')
}

export const pushParams = paramName => val => {
	const params = wurl('?') || {}
	params[paramName] = val
	changeParams(paramsObjectToStr(params))
}

export const getCollectionsBasedOnItems = (items, collectionKey, collectionPropertyKey) => {
	if (!collectionKey) {
		console.error('Please provide collectionKey')
		return items
	}
	const collections = []
	items.forEach(item => {
		const itemProperty = item[collectionKey]
		if(collectionPropertyKey) {
			itemProperty?.forEach(ic => {
				if (!collections.some(c => c[collectionPropertyKey] == ic[collectionPropertyKey])) {
					collections.push(ic)
				}
			})
		}
		else {
			if (!collections.some(c => c == itemProperty)) {
				collections.push(itemProperty)
			}
		}
	})
	return collections
}
