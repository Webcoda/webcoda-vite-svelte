'use strict'
import $ from 'jquery'
import Instafeed from 'instafeed.js'
import TwitterFetcher from 'twitter-fetcher'
import formatDate from 'date-fns/format'
import $clamp from 'clamp-js-main'
import '@/custom_vendors/filterizr'
import './socialstream.scss'

export class SocialStream {
	feeds: any[]
	$el: any
	options: {
		facebook: { page: string; accessToken: string; maxPerFeed: number; feederFn: any; getHtmlFn: any }
		twitter: { pageName: string; maxPerFeed: number; feederFn: any; getHtmlFn: any }
		instagram: {
			userId: string
			accessToken: string
			maxPerFeed: number
			feederFn: any
			getHtmlFn: any
			isLazyLoad: boolean
		}
		youtube: {
			apiKey: string
			playlistId: string
			maxPerFeed: number
			feederFn: any
			getHtmlFn: any
			isLazyLoad: boolean
		}
		filterizr: {
			animationDuration: number
			callbacks: {
				onFilteringStart: () => void
				onFilteringEnd: () => void
				onShufflingStart: () => void
				onShufflingEnd: () => void
				onSortingStart: () => void
				onSortingEnd: () => void
			}
			delay: number
			delayMode: string
			easing: string
			filter: string
			filterOutCss: { opacity: number; transform: string }
			filterInCss: { opacity: number; transform: string }
			layout: string
			selector: string
			setupControls: boolean
		}
		instafeed: { get: string; sortBy: string; target: string }
		clamp: { clamp: number }
		order: string //name of the social should match with the option keys
		orderNumberShownAtStartup: number
	}
	promise: Promise<void>
	orderArray: any

	constructor($el, options) {
		this.feeds = []
		this.$el = $el
		this.options = {
			facebook: {
				page: '',
				accessToken: '',
				maxPerFeed: 8,
				feederFn: this.getFacebookFeeds.bind(this),
				getHtmlFn: this.getFacebookHtml.bind(this),
			},
			twitter: {
				pageName: '',
				maxPerFeed: 8,
				feederFn: this.getTwitterFeeds.bind(this),
				getHtmlFn: this.getTwitterHtml.bind(this),
			},
			instagram: {
				userId: '',
				accessToken: '',
				maxPerFeed: 8,
				feederFn: this.getInstagramFeeds.bind(this),
				getHtmlFn: this.getInstagramHtml.bind(this),
				isLazyLoad: true,
			},
			youtube: {
				apiKey: '',
				playlistId: '',
				maxPerFeed: 8,
				feederFn: this.getYoutubeFeeds.bind(this),
				getHtmlFn: this.getYoutubeHtml.bind(this),
				isLazyLoad: true,
			},
			filterizr: {
				animationDuration: 0.5,
				callbacks: {
					onFilteringStart: function () {},
					onFilteringEnd: function () {},
					onShufflingStart: function () {},
					onShufflingEnd: function () {},
					onSortingStart: function () {},
					onSortingEnd: function () {},
				},
				delay: 0,
				delayMode: 'progressive',
				easing: 'ease-out',
				filter: 'all',
				filterOutCss: {
					opacity: 0,
					transform: 'scale(0.5)',
				},
				filterInCss: {
					opacity: 1,
					transform: 'scale(1)',
				},
				layout: 'packed',
				selector: '.filter-container',
				setupControls: true,
			},
			instafeed: {
				get: 'user',
				sortBy: 'most-recent',
				target: 'social-stream',
			},
			clamp: {
				clamp: 4,
			},
			order: 'instagram, twitter, youtube', //name of the social should match with the option keys
			orderNumberShownAtStartup: 0, // if 0, means it shows all. Index starts from 1
		}

		this.options = $.extend(true, this.options, options)
		this.promise = this.init()
	}

	init() {
		return this.render()
	}

	async render() {
		// check order
		this.orderArray = this.options.order.split(',').map((x) => x.trim())
		const feederFns = this.orderArray.map((x) => this.options[x].feederFn())

		if (
			this.orderArray
				.map((socialNetwork) => this.options[socialNetwork].isLazyLoad)
				.some((isLazyLoad) => !!isLazyLoad)
		) {
			await import('../utils/lazysizes')
		}

		return Promise.all(feederFns).then((results) => {
			let content = ''
			results.forEach((result, i) => {
				const key = this.orderArray[i]
				content += this.options[key].getHtmlFn(result[key], i)
			})
			const socialStreamHtml = this.getSocialStreamHtml(content)
			this.$el.html(socialStreamHtml)
			this.applyClamp()
			this.applyFilter()
		})
	}

	applyClamp() {
		const that = this
		$('.o-socialstream__item-text').each(function () {
			$clamp(this, that.options.clamp)
		})
	}

	applyFilter() {
		const $filterContainer = this.$el.find(this.options.filterizr.selector)
		const $filterBtns = this.$el.find('.o-socialstream__filter-btn')

		$filterBtns.click(function () {
			const $this = $(this)
			$('.o-socialstream__filter').find('.active').removeClass('active')
			$this.parent().addClass('active')
		})

		$filterContainer.filterizr(this.options.filterizr).filterizr('shuffle')
	}

	getFilterItemHtml(key, filterKey, label, icon, attr, additionalClass = '') {
		return `<div class="pb-1 mr-6 relative o-socialstream__filter-item ${additionalClass}" role='presentation'>
			<button title="Show ${label || key} feeds" aria-label="Show ${
			label || key
		} feeds" type="button" class="relative w-full flex justify-center items-center text-inherit o-socialstream__filter-btn o-socialstream__filter-btn--${key}" data-filter="${filterKey}" ${attr}>
				${
					icon
						? `<svg width="24" height="24" class="text-highlight mr-2 align-middle iconfz-m o-socialstream__filter-btn-icon" aria-hidden="true"><use xlink:href="#${icon}24" /></svg>`
						: ``
				}
				<span class="b-fsbtnlarge uppercase align-middle hidden-xs o-socialstream__filter-btn-text" aria-hidden="true">${
					label || key
				}</span>
			</button>
			<div class="absolute bottom-0 w-full opacity-0 bg-highlight o-socialstream__filter-indicator"></div>
		</div>`
	}

	getFilterHtml() {
		return `<div class="flex end-sm mb-4 o-socialstream__filter" role='tablist'>
			${this.getFilterItemHtml('all', 'all', 'All', '', 'data-shuffle', 'active')}
			${this.orderArray
				.map((x, i) => {
					return this.getFilterItemHtml(x, i + 1, this.options[x].label, x, '')
				})
				.join('')}
		</div>`
	}

	getSocialStreamHtml(contentHtml) {
		return `<div class="o-socialstream">
			${this.getFilterHtml()}
			<div class="overflow-hidden o-socialstream__content">
				<div class="filter-container row overflow-hidden o-socialstream__content-inner">${contentHtml}</div>
			</div>
		</div>`
	}

	getYoutubeFeeds() {
		const url =
			'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' +
			this.options.youtube.playlistId +
			'&key=' +
			this.options.youtube.apiKey +
			'&pageToken=&maxResults=' +
			this.options.youtube.maxPerFeed
		return new Promise((resolve, reject) => {
			$.ajax({
				url: url,
				cache: true,
				dataType: 'jsonp',
				success: (response) => {
					if (!!response.items) {
						this.feeds.youtube = response.items.map(function (item) {
							return {
								id: item.snippet.resourceId.videoId,
								time: formatDate(new Date(item.snippet.publishedAt), 'X'),
								thumbnail:
									item.snippet.thumbnails.maxres ||
									item.snippet.thumbnails.high ||
									item.snippet.thumbnails.standard ||
									item.snippet.thumbnails.default,
								title: item.snippet.title,
							}
						})
						resolve({
							youtube: this.feeds.youtube,
						})
					}
				},
			})
		})
	}

	getTwitterFeeds() {
		return new Promise((resolve, reject) => {
			const dateFormatter = (date) => formatDate(new Date(date))
			const handleTweets = (tweets) => {
				this.feeds.twitter = tweets.map(function (item, idx) {
					return {
						content: item.tweet,
						link: item.permalinkURL,
					}
				})
				resolve({
					twitter: this.feeds.twitter,
				})
			}
			const configProfile = {
				profile: {
					screenName: this.options.twitter.pageName,
				},
				domId: '',
				maxTweets: this.options.twitter.maxPerFeed,
				enableLinks: true,
				showUser: false,
				showTime: true,
				dateFunction: dateFormatter,
				showImages: false,
				lang: 'en',
				showInteraction: false,
				customCallback: handleTweets.bind(this),
				dataOnly: true,
			}

			TwitterFetcher.fetch(configProfile)
		})
	}

	getInstagramFeeds() {
		return new Promise((resolve, reject) => {
			let opts = {
				get: 'user',
				userId: this.options.instagram.userId,
				accessToken: this.options.instagram.accessToken,
				sortBy: 'most-recent',
				limit: this.options.instagram.maxPerFeed,
				target: 'social-stream',
				success: (data) => {
					if (!!data.data) {
						this.feeds.instagram = data.data.map(function (image) {
							return {
								link: image.link,
								title: !!image.caption ? image.caption.text : '',
								images: image.images.standard_resolution,
								time: image.created_time,
							}
						})
						resolve({
							instagram: this.feeds.instagram,
						})
					}
				},
			}
			opts = $.extend(true, opts, this.options.instafeed)
			const userFeed = new Instafeed(opts)
			userFeed.run()
		})
	}

	getFacebookFeeds() {
		return new Promise((resolve, reject) => {
			;(function (d, s, id) {
				var js,
					fjs = d.getElementsByTagName(s)[0]
				if (d.getElementById(id)) {
					return
				}
				js = d.createElement(s)
				js.id = id
				js.src = '//connect.facebook.net/en_US/sdk.js'
				fjs.parentNode.insertBefore(js, fjs)
			})(document, 'script', 'facebook-jssdk')

			window.fbAsyncInit = () => {
				var opts = this.options.facebook

				window.FB.init({
					appId: '2104933593075327',
					autoLogAppEvents: true,
					xfbml: true,
					version: 'v3.0',
				})
				window.FB.AppEvents.logPageView()
				window.FB.api('/' + opts.page + '/feed?access_token=' + opts.accessToken, (response) => {
					if (response && !response.error) {
						this.feeds.facebook = response.data.slice(0, opts.maxPerFeed).map((feed) => {
							return {
								id: feed.id,
								content: feed.message || feed.story,
								time: feed.created_time,
							}
						})

						resolve({
							facebook: this.feeds.facebook,
						})
					} else {
						console.error('Cannot get facebook feed: ', response.error)
					}
				})
			}
		})
	}

	getFacebookHtml(items, orderNumber) {
		return (
			items &&
			items
				.map((item) => {
					return `<div class="filtr-item col-12 sm-col-6 md-col-4 lg-col-3 pt-2 pb-2 o-socialstream__col o-socialstream__col--facebook" data-category="${
						orderNumber + 1
					}">
						<div class="bg-dark u-embed o-socialstream__item o-socialstream__item--facebook">
							<div class="u-embed__item o-socialstream__item-inner">
								<div class="fx1 pt-4 pb-4 pl-4 pr-4 o-fancylist">
									<div class="o-socialstream__item-text">${item.content}</div>
								</div>
							</div>
							<a class="absolute link-colorstay link-tdn iconfz-m mb-4 ml-4 bottom-0 l0 o-socialstream__itemicon" href="https://facebook.com/${
								item.id
							}" target="_blank">
								<span class="g-icon-facebook" aria-hidden="true"></span>
							</a>
						</div>
					</div>`
				})
				.join('')
		)
	}

	getInstagramHtml(items, orderNumber) {
		const lazyLoad = (item) => `data-bgset="${item.images.url}"`
		const standardBgimg = (item) => `style="background-image: url(${item.images.url})"`

		return items
			? items
					.map((item) => {
						return `<div class="filtr-item col-12 sm-col-6 md-col-4 lg-col-3 pt-2 pb-2 o-socialstream__col o-socialstream__col--instagram" data-category="${
							orderNumber + 1
						}">
				<div class="relative">
					<a class="block bg-dark u-embed o-socialstream__item o-socialstream__item--instagram" href="${item.link}" title="${
							item.title
						}" target="_blank">
						<div class="bgimg u-embed__item o-socialstream__item-inner ${this.options.instagram.isLazyLoad ? 'js-lazysizes' : ''}"
							${this.options.instagram.isLazyLoad ? lazyLoad(item) : standardBgimg(item)}>
							<div class="o-fancylist"></div>
						</div>
					</a>
					<a class="absolute text-white link-colorstay link-tdn iconfz-m mb-4 ml-4 bottom-0 l0 o-socialstream__itemicon" href=${
						item.link
					}>
						<span class="g-icon-instagram" aria-hidden="true"></span>
					</a>
				</div>
			</div>`
					})
					.join('')
			: ''
	}

	getTwitterHtml(items, orderNumber) {
		return items
			? items
					.map((item) => {
						return `<div class="filtr-item col-12 sm-col-6 md-col-4 lg-col-3 pt-2 pb-2 o-socialstream__col o-socialstream__col--twitter" data-category="${
							orderNumber + 1
						}">
					<div class="bg-dark u-embed o-socialstream__item o-socialstream__item--twitter">
						<div class="u-embed__item bg-dark u-embed o-socialstream__item-inner">
							<div class="fx1 pt-4 pb-4 pl-4 pr-4 o-fancylist">
								<div class="mb-2 o-socialstream__item-text">${item.content}</div>
							</div>
						</div>
						<a class="absolute text-inherit link-tdn iconfz-m mb-4 ml-4 bottom-0 l0 o-socialstream__itemicon" href="${
							item.link
						}" target="_blank">
							<span class="g-icon-twitter" aria-hidden="true"></span>
						</a>
					</div>
				</div>`
					})
					.join('')
			: ''
	}

	getYoutubeHtml(items, orderNumber) {
		const lazyLoad = (item) => `data-bgset="${item.thumbnail.url}"`
		const standardBgimg = (item) => `style="background-image: url(${item.thumbnail.url})"`

		console.log(this.options.youtube, 'll')

		return items
			? items
					.map((item) => {
						return `<div class="filtr-item col-12 sm-col-6 md-col-4 lg-col-3 pt-2 pb-2 o-socialstream__col o-socialstream__col--youtube" data-category="${
							orderNumber + 1
						}">
				<div class="relative">
					<a class="block bg-dark u-embed o-socialstream__item o-socialstream__item--youtube" href="https://youtube.com/watch?v=${
						item.id
					}" title="${item.title}" target="_blank">
						<div class="u-embed__item u-bgimg o-socialstream__item-inner ${
							this.options.youtube.isLazyLoad ? 'js-lazysizes' : ''
						}" ${this.options.youtube.isLazyLoad ? lazyLoad(item) : standardBgimg(item)}>
							<div class="o-fancylist"></div>
						</div>
					</a>
					<a class="absolute text-white text-inherit link-colorstay link-tdn iconfz-m mb-4 ml-4 bottom-0 l0 o-socialstream__itemicon" href="https://youtube.com/watch?v=${
						item.id
					}" target="_blank">
						<span class="g-icon-youtube" aria-hidden="true"></span>
					</a>
				</div>
			</div>`
					})
					.join('')
			: ''
	}
}

export default (el, $el, opts) => {
	new SocialStream($el, opts)
}
