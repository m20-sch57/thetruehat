/* eslint-disable no-undef */
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

const config = require("./config.json");

webpackConfig =  {
    entry: {
        css: "./src/css.js",
        js: "./src/main.js"
    },
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

if (config.env === config.PROD) {
    webpackConfig = {
        ...webpackConfig,
        mode: "production",
    };
}

if (config.env === config.DEVEL) {
    webpackConfig = {
        ...webpackConfig,
        mode: "development",
        watch: true,
        watchOptions: {
            ignored: /node_modules/,
            poll: 1000
        },
        devtool: "eval-source-map",
    };
}

if (config.env === config.STAGING) {
    webpackConfig = {
        ...webpackConfig,
        mode: "development",
        devtool: "eval-source-map",
    };
}

module.exports = webpackConfig;
