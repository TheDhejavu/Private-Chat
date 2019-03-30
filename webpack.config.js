const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        home:"./public/src/scripts/Home.js",
        find:"./public/src/scripts/Find.js",
        login:"./public/src/scripts/login.js"
    },
    output:{
        path: path.resolve(__dirname, "public/dist/scripts"),
        filename: "[name]-bundle.js",
    },

    module:{
        rules:[
        {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['babel-preset-env']
                }
            }
        },
        {
            test: /\.hbs$/,
            use: {
                loader: 'handlebars-loader',
                query:{
                    helperDirs:[
                        path.resolve( __dirname, "public/src/scripts/helpers/handlebars")
                    ]
                }
            }
        }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({ // <-- key to reducing build size
            "process.env.NODE_ENV": "development"
        }),

        new webpack.optimize.AggressiveMergingPlugin(),//Merge chunks
        new webpack.NoEmitOnErrorsPlugin()
   ]
}
