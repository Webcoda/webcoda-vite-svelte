export function getBoundsBasedOnMarkerPositions(markerPositions, map, gmap) {
	const bounds = new gmap.LatLngBounds()
	markerPositions.forEach(markerPosition => {
		bounds.extend(markerPosition)
	})
	return bounds;
}

export function getCenterOfBoundsBasedOnMarkerPositions(markerPositions, map, gmap) {
	const bounds = getBoundsBasedOnMarkerPositions(markerPositions, map, gmap);
	return bounds.getCenter();
}

export function fitBoundsBasedOnMarkerPositions(markerPositions, map, gmap) {
	const bounds = getBoundsBasedOnMarkerPositions(markerPositions, map, gmap)
	map.fitBounds(bounds);
}

export function getPositionAfterOffset(latlng, offsetx, offsety, zoom, map, googleMaps) {
	const projection = map.getProjection();

	if (!projection) return null;

	const point1 = projection.fromLatLngToPoint(
		(latlng instanceof googleMaps.LatLng) ? latlng : new googleMaps.LatLng(latlng),
	);

	const _zoom = zoom || map.getZoom();

	const point2 = new googleMaps.Point(
		((typeof (offsetx) == 'number' ? offsetx : 0) / (2 ** _zoom)) || 0,
		((typeof (offsety) == 'number' ? offsety : 0) / (2 ** _zoom)) || 0,
	);
	return (projection.fromPointToLatLng(new googleMaps.Point(
		point1.x + point2.x,
		point1.y + point2.y,
	)));
};
