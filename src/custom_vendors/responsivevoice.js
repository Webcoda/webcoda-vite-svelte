// Modified by Vic

import hoverintent from 'hoverintent';

export default (_config) => {
	if (typeof rvAgentPlayer !== 'undefined') {
		throw new Error('ResponsiveVoice Website Agent is already running')
	}

	var config = {
		welcomeMessage: true,
		speakSelectedText: true,
		speakLinks: true,
		speakInactivity: false,
		speakEndPage: false,
		exitIntent: false,
		accesibilityNavigation: true,
		accesibilityNavigation2: true,
		welcomeMessageTime: false,
		text_welcomeMessage: null,
		text_speakInactivity: null,
		text_speakEndPage: null,
		text_exitIntent: null,
		trackEvents: false,
		abTesting: false,
		analytics_id: null,
		another_field: null,
		localStorageKey: 'enabled_responsivevoice',
		..._config,
	}

	function isEnabled() {
		return !!localStorage.getItem(config.localStorageKey)
	}

	var splitTestEnabled = config.abTesting || false
	var splitTest_useGS = Math.random() < 0.5

	function GetRandomMsg(text) {
		var texts = text.split('|')
		return texts[Math.floor(Math.random() * texts.length)]
	}

	function getHiddenProp() {
		var prefixes = ['webkit', 'moz', 'ms', 'o']

		// if 'hidden' is natively supported just return it
		if ('hidden' in document) return 'hidden'

		// otherwise loop over all the known prefixes until we find one
		for (var i = 0; i < prefixes.length; i++) {
			if (prefixes[i] + 'Hidden' in document) return prefixes[i] + 'Hidden'
		}

		// otherwise it's not supported
		return null
	}

	function getVisibilityState() {
		var prefixes = ['webkit', 'moz', 'ms', 'o']

		// if 'visibilityState' is natively supported just return it
		if ('visibilityState' in document) return 'visibilityState'

		// otherwise loop over all the known prefixes until we find one
		for (var i = 0; i < prefixes.length; i++) {
			if (prefixes[i] + 'VisibilityState' in document) return prefixes[i] + 'VisibilityState'
		}
		// otherwise it's not supported
		return null
	}

	function isHidden() {
		var prop = getHiddenProp()
		if (!prop) return false

		return document[prop]
	}

	function isPrerendered() {
		var prop = getVisibilityState()
		//console.log(prop);
		if (!prop) return false
		//console.log(document[prop]);
		if (document[prop] != 'prerender') return false
		return document[prop]
	}
	console.log('isHidden: ' + isHidden())
	console.log('Prerender: ' + isPrerendered())

	//Analytics

	//Search Message

	var prerenderUsed = false

	if (isPrerendered() && !prerenderUsed) {
		prerenderUsed = true
		setTimeout(function() {
			if (!splitTestEnabled || (splitTestEnabled && splitTest_useGS)) {
				var txt = GetRandomMsg('')
				if (txt != null && txt != '' && isEnabled()) {
					console.log('Launching search message')
					responsiveVoice.speak('According to Voicebrite, ' + txt, 'UK English Male')
				}
			}

			//Search Message Split Test - Impression
			if (splitTestEnabled) {
				if (splitTest_useGS) {
					trackEvent('searchMessage', 'impressionAB', 'true')
				} else {
					trackEvent('searchMessage', 'impressionAB', 'false')
				}
			} else {
				trackEvent('searchMessage', 'impression')
			}
		}, 1500)
	}

	(function() {
		//We came from prerender
		var smessInterval = null
		if (prerenderUsed) {
			smessInterval = setInterval(function() {
				if (!isPrerendered()) {
					clearInterval(smessInterval)

					//Search Message Split Test - Impression
					if (splitTestEnabled) {
						if (splitTest_useGS) {
							trackEvent('searchMessage', 'visitAB', 'true')
						} else {
							trackEvent('searchMessage', 'visitAB', 'false')
						}
					} else {
						trackEvent('searchMessage', 'visit')
					}
				}
			}, 1000)
		}

		console.log('Configuring')

		//Speak links
		var _allLinks = document.getElementsByTagName('a')
		Array.prototype.forEach.call(_allLinks, function(el) {
			hoverintent(
				el,
				function() {
					if (config.speakLinks && isEnabled()) {
						//responsiveVoice.cancel();
						responsiveVoice.speak(el.textContent, 'UK English Male')
						trackEvent('agentFeature', 'spokenLink')
					}
				},
				function() {},
			)
		})

		//Speak selected text
		var selectedText = ''
		var last_selectedText = ''

		function getSelectionText() {
			var text = ''
			if (window.getSelection) {
				text = window.getSelection().toString()
			} else if (document.selection && document.selection.type != 'Control') {
				// for Internet Explorer 8 and below
				text = document.selection.createRange().text
			}
			return text
		}

		if (config.speakSelectedText) {
			attachToElements(document.querySelectorAll('PRE,DIV'), ['mouseup', 'touchend'], onMouseUp)
		}

		function attachToElements(elements, events, callback) {
			if (elements.length > 0) {
				for (var i = 0; i < elements.length; i++) {
					events.forEach(function(event) {
						elements[i].addEventListener(event, function(e) {
							callback()
						})
					})
				}
			}
		}

		function onMouseUp() {
			selectedText = getSelectionText()
			console.log('Selected text *' + selectedText + '*')
			if (selectedText != last_selectedText && selectedText != '' && isEnabled()) {
				last_selectedText = selectedText

				responsiveVoice.cancel() // stop anything currently being spoken
				responsiveVoice.speak(selectedText, 'UK English Male') //speak the text as returned by getSelectionText
				trackEvent('agentFeature', 'highlightText')
			}
		}

		//Speak welcome message. Will only play if user didn't came from google.
		var welcomeMessageLaunched = false
		if (
			config.welcomeMessage &&
			(!config.welcomeMessageTime || oneTimeTest('welcomeMessage')) &&
			!isPrerendered() &&
			!prerenderUsed
		) {
			welcomeMessageLaunched = true
			setTimeout(function() {
				if (config.text_welcomeMessage != null && config.text_welcomeMessage != '' && isEnabled()) {
					console.log('Launching welcome message')
					responsiveVoice.speak(GetRandomMsg(config.text_welcomeMessage), 'UK English Male')
					trackEvent('agentFeature', 'welcomeMessage')
				}
			}, 1500)
		}

		//Speak welcome message when user came from Google. Won't play if default message played
		var welcomeMessage2Launched = false
		var welcomeMessage2Interval = null
		if (
			!welcomeMessageLaunched &&
			config.welcomeMessage2 &&
			(!config.welcomeMessageTime || oneTimeTest('welcomeMessage2')) &&
			config.text_welcomeMessage2 != null &&
			config.text_welcomeMessage2 != ''
		) {
			//Wait until we're visible and launch message

			welcomeMessage2Interval = setInterval(function() {
				console.log('Welcome Message from Google Waiting')
				if (!isPrerendered() && !welcomeMessage2Launched && isEnabled()) {
					console.log('Welcome Message from Google launched')

					welcomeMessage2Launched = true
					responsiveVoice.speak(GetRandomMsg(config.text_welcomeMessage2), 'UK English Male')
					trackEvent('agentFeature', 'welcomeMessage2')
					clearInterval(welcomeMessage2Interval)
				}
			}, 1000)
		}

		//Speak when scroll end
		function bindScroll() {
			if (
				window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100 &&
				config.text_speakEndPage != null &&
				config.text_speakEndPage != '' &&
				isEnabled()
			) {
				console.log('bottom')
				window.removeEventListener('scroll', bindScroll)

				responsiveVoice.speak(GetRandomMsg(config.text_speakEndPage), 'UK English Male')
				trackEvent('agentFeature', 'scrollEnd')
			}
		}

		if (config.speakEndPage) {
			window.addEventListener('scroll', bindScroll)
		}

		//Inactivity
		var idleTime = 0
		if (config.speakInactivity) {
			setInterval(timerIncrement, 1000)

			window.addEventListener('mousemove', function() {
				idleTime = 0
			})

			window.addEventListener('keyup', function() {
				idleTime = 0
			})
		}

		function timerIncrement() {
			idleTime += 1000

			if (idleTime >= 30000 && isEnabled()) {
				responsiveVoice.speak(GetRandomMsg(config.text_speakInactivity), 'UK English Male')
				trackEvent('agentFeature', 'inactivity')
				idleTime = 0
			}
		}

		//Exit intent
		if (config.speakInactivity) {
			console.info('setting up exit intent')
			document.addEventListener('mouseout', exitIntent)
		}

		function exitIntent(e) {
			if (e.clientY < 0 && isEnabled()) {
				responsiveVoice.speak(GetRandomMsg(config.text_exitIntent), 'UK English Male')
				trackEvent('agentFeature', 'exitIntent')
			}
		}

		//Tab and ctrl to speak - Accessibility Navigation
		var started = 0
		if (config.accesibilityNavigation) {
			console.log('accesibilityNavigation')

			document.addEventListener('keyup', function(e) {
				console.log('keyup called')

				var code = e.keyCode || e.which

				if (e.target) {
					switch (e.target.tagName) {
						case 'A':
							if (code == '9' && isEnabled()) {
								responsiveVoice.speak('Link 2 ' + e.target.text, 'UK English Male')
								trackEvent('agentFeature', 'accesibilityNavigation', 'tab')
							}
							break

						case 'BUTTON':
							if (code == '9' && isEnabled()) {
								setTimeout(responsiveVoice.speak(e.target.textContent + ' button', 'UK English Male'), 1000)
								trackEvent('agentFeature', 'accesibilityNavigation', 'tab')
							}
							break

						case 'TEXTAREA':
							if (code == '9' && isEnabled()) {
								responsiveVoice.speak(
									'Text Input ' + document.querySelectorAll(':focus')[0].getAttribute('placeholder'),
									'UK English Male',
								)
								trackEvent('agentFeature', 'accesibilityNavigation', 'tab')
							}
							break
					}
				}
			})
		}

		if (config.accesibilityNavigation2) {
			document.addEventListener('keyup', function(e) {
				console.log('keyup called')

				var code = e.keyCode || e.which

				if (code == '40' && e.ctrlKey && isEnabled()) {
					console.log('ctrl + down arrow')

					responsiveVoice.speak(document.querySelectorAll('p')[started].textContent, 'UK English Male')
					trackEvent('agentFeature', 'accesibilityNavigation', 'ctrl-arrow')
					document.querySelectorAll('p')[started].scrollIntoView(false)
					started = started + 1
				}
				if (code == '38' && e.ctrlKey && isEnabled()) {
					console.log('ctrl + up arrow')

					responsiveVoice.speak(document.querySelectorAll('p')[started].textContent, 'UK English Male')
					trackEvent('agentFeature', 'accesibilityNavigation', 'ctrl-arrow')
					document.querySelectorAll('p')[started].scrollIntoView(false)
					started = started - 1
					if (started < 1) {
						started = 0
					}
				}
			})
		}
	})()

	function createCookie(name, value, days) {
		if (days) {
			var date = new Date()
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
			var expires = '; expires=' + date.toGMTString()
		} else var expires = ''
		document.cookie = name + '=' + value + expires + '; path=/'
	}

	function readCookie(name) {
		var nameEQ = name + '='
		var ca = document.cookie.split(';')
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i]
			while (c.charAt(0) == ' ') c = c.substring(1, c.length)
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
		}
		return null
	}

	function eraseCookie(name) {
		createCookie(name, '', -1)
	}

	function getOrCreateTest(name, prob, days) {
		var c = readCookie(name)

		if (c == null) {
			console.log('Cookie set')
			var v = Math.random() < (prob != null ? prob : 0.5)
			//1 hour
			createCookie(name, v.toString(), days != null ? days : 1 / 24)
			return v
		}
		console.log('Cookie read')
		return c == true.toString()
	}

	function oneTimeTest(name, days) {
		var c = readCookie(name)

		if (c == null) {
			console.log('Cookie set - one time True')
			//1 hour
			createCookie(name, false.toString(), days != null ? days : 0.5 / 24)
			return true
		}
		console.log('Cookie read - one time False')
		return false
	}

	function trackEvent(category, action, name, value) {
		if (config.trackEvents != true) return

		console.log('Track ' + category + ',' + action + ',' + name)

		var url = 'https://ai.learnbrite.com/analytics.php'
		var postArray = []

		var data = {
			idsite: config.analytics_id,
			rec: 1,
			url: window.location.href,
			rand: Math.floor(Math.random() * 1000000000),
			e_c: category,
			e_a: action,
			e_n: name,
			e_v: value,
		}

		for (var property in data) {
			postArray.push(encodeURI(property + '=' + data[property]))
		}

		var xhttp = new XMLHttpRequest()

		xhttp.open('POST', url, true)
		xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
		xhttp.send(postArray.join('&'))

		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log('Tracking Success')
				console.log(data)
			}
		}
	}

}
