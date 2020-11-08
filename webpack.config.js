var path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/main.js',
	mode: "development",
	output: {
		path: path.resolve(__dirname, './static/dist'),
		publicPath: '/dist/',
		filename: 'build.js'
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			}
		]
	},
	resolve: {
		alias: {
			_: path.resolve(__dirname, "src/components"),
			__:path.resolve(__dirname, "src")
		}
	},
	plugins: [
		new VueLoaderPlugin(),
		new HTMLWebpackPlugin({
			template: path.join(__dirname, "src/index.html"),
			hash: true,
			filename: "../index.html"
		})
	]
}
