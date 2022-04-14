export function getImageCropByCropAlias(umbracoImage, cropAlias) {
	if (!umbracoImage || !cropAlias) return undefined

	const { umbracoFile } = umbracoImage

	return umbracoFile.crops.find(crop => crop.alias == cropAlias)
}

export function getImageUrlByCropAlias(umbracoImage, cropAlias) {
	const crop = getImageCropByCropAlias(umbracoImage, cropAlias)

	if (!crop) return umbracoImage.url

	return `${umbracoFile.src}?mode=crop&width=${crop.width}&height=${crop.height}&center=${umbracoFile.focalPoint?.top},${umbracoFile.focalPoint?.left}`
}

/**
 *
 * @param {Object} umbImage umbracoFile object that has crops
 * @param {Object} cropAliasMediaPairs .e.g { 'Slider': '(max-width: 767px)', 'Teaser': '(min-width: 768px)' }
 * @param {Array[string]} fileTypes need an undefined without type
 */
export function getUmbracoImageSources({umbImage, cropAliasMediaPairs, fileTypes = ['image/webp', undefined]} = {}){
	const sources = []

	if(!umbImage) return sources;
	const { allUrls } = umbImage;

	if(!allUrls || !cropAliasMediaPairs) return;

	const cropAliases = Object.keys(cropAliasMediaPairs);

	Object.keys(allUrls).forEach(cropAlias => {
		fileTypes.forEach(fileType => {

			if (cropAliases.includes(cropAlias)) {
				sources.push({
					srcset: [
						{
							src: allUrls?.[cropAlias] + (fileType == 'image/webp' ? '&format=webp&quality=80' : ''),
							descriptor: `${getImageCropByCropAlias(umbImage, cropAlias)?.width}w`,
						},
					],
					type: fileType,
					media: cropAliasMediaPairs[cropAlias],
				})
			}
		})
	})

	return sources;
}
