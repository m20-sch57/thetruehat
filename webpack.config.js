/* eslint-disable no-undef */
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    watchOptions: {
        poll: 1000
    },
    entry: {
        css: "./src/css.js",
        js: "./src/main.js"
    },
    mode: "development",
    devtool: "eval-source-map",
    output: {
        path: path.resolve(__dirname, "./static/dist"),
        publicPath: "/dist/",
        filename: "[name]bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            url: false
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            cmp: path.resolve(__dirname, "src/components"),
            src: path.resolve(__dirname, "src")
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
};
