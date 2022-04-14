import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
    	alias: {
			"@" : path.resolve(__dirname, './src'),
			"@@": path.resolve(__dirname, "./src/modules"),
		},
	},
	plugins: [
		mkcert(), //to add certificate to https
		svelte()
	],
	build: {
		manifest: true,
		rollupOptions: {
			// overwrite default .html entry
			input: '/src/main.ts',
		},
		// outDir: '../www_shared',
	},
	server: {
		https: true,
	},
})
