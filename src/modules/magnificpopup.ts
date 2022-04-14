import 'magnific-popup'
import getVideoId from 'get-video-id'
import './magnificpopup.scss'


export default async (el, $el, opts) => {
	const OPTS = {
		iframe: {
			type: 'iframe',
			iframe: {
				patterns: {
					youtu: {
						index: 'youtu.be/',
						id: function(url) {
							// Capture everything after the hostname, excluding possible querystrings.
							var m = url.match(/^.+youtu.be\/([^?]+)/)
							if (null !== m) {
								return m[1]
							}
							return null
						},
						// Use the captured video ID in an embed URL.
						// Add/remove querystrings as desired.
						src: '//www.youtube.com/embed/%id%?autoplay=1&rel=0',
					},
				},
			},
		},
	}

	if (opts.type == 'inline' && opts.key == 'videopopup') {
		const { videoSelector, videoUrl } = opts;


		const [{ default: Plyr }] = await Promise.all([
			import('plyr'),
			import('@@/videopopup.scss')
		])
		const plyr = new Plyr(videoSelector)
		if(!window.plyr) window.plyr = {}
		window.plyr[videoSelector] = plyr;
		const video = getVideoId(videoUrl);
		const source = {
			src: video.id || videoUrl,
		}
		if(!video?.id) {
			source.type = 'video/mp4'
		} else {
			source.provider = video.service
		}

		opts.callbacks = {
			open() {
				plyr.source = {
					type: 'video',
					sources: [source]
				}
				plyr.play()
			},
			close() {
				plyr.stop()
			},
		}
	}

	const _opts = { ...OPTS[opts.key], ...opts }
	$el.magnificPopup(_opts)
}
