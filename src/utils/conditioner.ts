import $ from 'jquery'
import JSON5 from 'json5'
import * as conditioner from 'conditioner-core'

export const addInitialPlugins = () => {
	conditioner.addPlugin({
    // converts module aliases to paths
    moduleSetName: (name) => `${name}`,

    // use default exports as constructor
    moduleGetConstructor: (module) => module.default,

    moduleImport: (name) => import(`../modules/${name}.ts`),

    moduleSetConstructorArguments: (name, el) => {
      const $el = $(el);
      let opts = {};
      try {
        if ($el.attr("data-module-options")) {
          opts = {
            ...opts,
            ...JSON5.parse($el.attr("data-module-options")),
            ...$el.data("moduleOptionsHidden"),
          };
        }
        return [el, $el, opts];
      } catch (err) {
        console.error(err);
        return [el, $el, opts];
      }
    },

    // the plugin "monitor" hook
    monitor: {
      // the name of our monitor, not prefixed with "@"
      name: "visible",

      // the monitor factory method, this will create our monitor
      create: (context, element) => ({
        // current match state
        matches: false,

        // called by conditioner to start listening for changes
        addListener(change) {
          new IntersectionObserver((entries) => {
            // update the matches state
            this.matches = entries.pop().isIntersecting == context;

            // inform conditioner of the new state
            change();
          }).observe(element);
        },
      }),
    },
  });
	conditioner.addPlugin({
		monitor: {
			name: 'on',
			create: (context, el) => {
				console.log('xxx', context, el)
				return {
					matches: false,
					addListener(change) {
						context.split(',').forEach(evType => {
							el.addEventListener(evType, () => {
								this.matches = true;
								change()
							})
						})
					}
				}
			}
		}
	})
}

/**
 * hydrate `el` element that contains the elements with [data-module]
 * @param {DOMElement} el element that contains the elements with [data-module] (not the [data-module] element itself)
 */
export const hydrate = el => {
	conditioner.hydrate(el)
}

/**
 * add initial plugins and hydrate `el` element that contains the elements with [data-module]
 * @param {DOMElement} el element that contains the elements with [data-module] (not the [data-module] element itself)
 */
export const addInitialPluginsAndHydrate = el => {
	addInitialPlugins()
	hydrate(el)
}

export const getAsMixin = () => {
	addInitialPlugins()
	return {
		mounted() {
			hydrate(this.$el)
		},
	}
}
