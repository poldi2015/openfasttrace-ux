/*
  OpenFastTrace UX

 Copyright (C) 2024-2025 itsallcode.org, Bernd Haberstumpf

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public
 License along with this program.  If not, see
 <http://www.gnu.org/licenses/gpl-3.0.html>.
*/
const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');                  // build ts
const {CleanWebpackPlugin} = require('clean-webpack-plugin');         // remove build directory
const CopyWebpackPlugin = require('copy-webpack-plugin');               // copy non minimized files
//const MiniCssExtractPlugin = require('mini-css-extract-plugin');

//const HtmlWebpackPlugin = require('html-webpack-plugin');  // minimize html
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
//const ESLintPlugin = require('eslint-webpack-plugin'); // code linter

const __base = path.resolve(__dirname, '../..');
const __src = path.resolve(__base, 'src/main');

module.exports = {
    // Javascript and ts minimization source trees
    entry: path.resolve(__src, 'js/openfasttrace.js'),              // Main entry point for minimization
    output: {
        filename: 'js/openfasttrace.js',                            // Output bundle
        path: path.resolve(__base, 'build/dist'),                   // Output directory
        clean: true,                                                // Automatically clean build directory
    },
    devtool: 'source-map',                                          // separate source map file to minimize code for debugger

    // Minimization source file compiler
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',                                   // Use ts-loader for TypeScript files
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,                                      // Use Babel loader for modern JS syntax
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',                                 // Inject CSS into the DOM
                    //MiniCssExtractPlugin.loader,                    // Extracts CSS into separate files
                    'css-loader',                                   // Turns CSS into commonjs, intermediate step needed for webpack to compile CSS
                    'resolve-url-loader',                           // Resolves relative paths in Sass
                    'sass-loader',                                  // Compiles Sass to CSS
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                type: 'asset/inline',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],                                 // Resolve these file extensions
        alias: {
            "@main": path.resolve(__src, "js"),
            "@html": path.resolve(__src, "html"),
            "@css": path.resolve(__src, "css"),
            "@libs": path.resolve(__src, "libs"),
            "@resources": path.resolve(__src, "resources"),
            "@images": path.resolve(__src, "resources/images"),
        },
    },
    plugins: [
        new CleanWebpackPlugin(),                                   // Clean the output directory before each build
        new CopyWebpackPlugin({
            patterns: [
                {from: 'src/main/openfasttrace.html', to: './',},
                {
                    from: 'src/main/resources',
                    to: './resources',
                    globOptions: {
                        ignore: ['**/*.ts', '**/*.map', '**/*.png', '**/*.svg'],
                    },
                },
                // images are excluded as they are inlined
            ],
        }),
        //new MiniCssExtractPlugin({
        //    filename: 'css/openfasttrace.css',                             // Output CSS file
        //}),
        new webpack.ProvidePlugin({                                 // Inline JQuery
            $: 'jquery',                                            // Make jQuery globally available as $
            jQuery: 'jquery',                                       // Make jQuery globally available as jQuery
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin(),                                     // Minify Typescript
            new CssMinimizerPlugin(),                               // Minify CSS
        ],
    },

    // Enable watch mode
    watch: true,
    watchOptions: {
        ignored: /node_modules/,                                    // Ignore node_modules for performance
        aggregateTimeout: 300,                                      // Delay rebuild after the first change (ms)
        poll: 1000,                                                 // Use polling (useful for network filesystems)
    },
};
