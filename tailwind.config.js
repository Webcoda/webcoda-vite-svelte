module.exports = {
  content: [
	  "./index.html",
	  "./src/**/*.{svelte,js,ts}",
	  "../**/*.cshtml"
	],
  theme: {
    extend: {
		colors: {
			error: 'red',
		}
	},
  },
  plugins: [],
};
