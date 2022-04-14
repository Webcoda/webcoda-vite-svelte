import $ from 'jquery'

export default (el, $el, opts) => {
    console.log('el $el', el, $el)
    const $playPause = $el.find('.o-audio-player__play-button')
    const audio = el.querySelector('audio')
    const timeline = el.querySelector('.o-audio-player__timeline')
    const timeDuration = el.querySelector('.o-audio-player__timestamp__duration')
    const totalBar = el.querySelector('.o-audio-player__playhead__total-bar')
    const playHead = el.querySelector('.o-audio-player__playhead')
    const volumeTrack = el.querySelector('.o-audio-player__volume__track')
    const volumeButton = el.querySelector('.o-audio-player__volume__button')

	// set the total audio duration
	let duration
	audio.addEventListener('loadeddata', () => {
		duration = audio.duration
		setVolumeTrack()
	})

	$playPause.on('click', e => {
		if (audio.paused) {
			audio.play()
		} else {
			audio.pause()
		}
	})

	//draggable playhead
	let onPlayHead = false
	const timelineWidth = timeline.offsetWidth - playHead.offsetWidth

    document.addEventListener('dragend', () => {
        onPlayHead = false
        window.removeEventListener('mousemove', moveHead, true)
    }, true)

	playHead.addEventListener(
		'mousedown',
		() => {
			audio.pause()
			onPlayHead = true
			window.addEventListener('mousemove', moveHead, true)
		},
		false,
	)

	window.addEventListener(
		'mouseup',
		() => {
			if (onPlayHead == true) {
				window.removeEventListener('mousemove', moveHead, true)
			}
			onPlayHead = false
		},
		true,
	)

	const moveHead = e => {
		let leftValue = (((e.clientX - timeline.getBoundingClientRect().left) / timelineWidth) * 100).toFixed(2)
		leftValue = leftValue >= 100 ? 100 : leftValue
		leftValue = leftValue <= 0 ? 0 : leftValue
		playHead.style.left = `${leftValue}%`
		totalBar.style.width = leftValue !== 100 ? `calc(${leftValue}% + 3px)` : `${leftValue}%`
	}

    // volume controls event handler
    volumeTrack.addEventListener('click', (e) => {
        const volume = (1 - ((e.clientY - volumeTrack.getBoundingClientRect().top) / volumeTrack.clientHeight)).toFixed(1)
        audio.volume = volume
    })

	// on volume change update the volume control
	audio.addEventListener('volumechange', () => {
		setVolumeTrack()
	})

	audio.addEventListener('timeupdate', () => {
		const currentTime = audio.currentTime
		const timePercent = (100 * (currentTime / duration)).toFixed(2)
		playHead.style.left = `${timePercent}%`
		totalBar.style.width = timePercent !== 100 ? `calc(${timePercent}% + 3px)` : `${timePercent}%`
		timeDuration.innerText = convertToTimeString(currentTime)
	})

	timeline.addEventListener('click', e => {
		const timeToSet = (
			duration *
			((e.clientX - timeline.getBoundingClientRect().left) / timeline.clientWidth)
		).toFixed(2)
		audio.currentTime = timeToSet
	})

	function convertToTimeString(seconds) {
		const date = new Date(null)
		date.setSeconds(seconds)
		const timeString = date.toISOString().substr(14, 5)
		return timeString
	}

    function setVolumeTrack() {
        const audioVolume = (audio.volume * 93).toFixed(2)
        volumeButton.style.bottom = `${audioVolume}%`
    }
}
