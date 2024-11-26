const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');                  // build ts
const { CleanWebpackPlugin } = require('clean-webpack-plugin');         // remove build directory
const CopyWebpackPlugin = require('copy-webpack-plugin');               // copy non minimized files

//const HtmlWebpackPlugin = require('html-webpack-plugin');  // minimize html
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // minimize css
//const ESLintPlugin = require('eslint-webpack-plugin'); // code linter

const __base = path.resolve(__dirname, '../..');
const __src = path.resolve(__base, 'src/main');

module.exports = {
    // Javascript and ts minimization source trees
    entry: path.resolve(__src, 'js/openfasttrace.js'),              // Main entry point for minimization
    output: {
        filename: 'js/openfasttrace.js',                    // Output bundle
        path: path.resolve(__base, 'build/dist'),        // Output directory
        clean: true,                                        // Automatically clean build directory
    },
    devtool: 'source-map',                                // separate source map file to deminimize code for debugger

    // Minimization source file compiler
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader', // Use ts-loader for TypeScript files
                exclude: /node_modules/,
            },
            {
                test: /\.m?js$/, // Use Babel loader for modern JS syntax
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'], // Resolve these file extensions
    },
    plugins: [
        new CleanWebpackPlugin(), // Clean the output directory before each build
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/main/libs', to: 'libs' }, // Copy all libraries to the dist/libs folder
                { from: 'src/main/html', to: './html' }, // Copy all libraries to the dist/libs folder
                { from: 'src/main/css', to: './css' }, // Copy all libraries to the dist/libs folder
                { from: 'src/main/resources', to: './resources' }, // Copy all libraries to the dist/libs folder
            ],
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin(),                                         // Minify Typescript
            new CssMinimizerPlugin(),                                   // Minify CSS
        ],
    },

    // Enable watch mode
    watch: true,
    watchOptions: {
        ignored: /node_modules/, // Ignore node_modules for performance
        aggregateTimeout: 300, // Delay rebuild after the first change (ms)
        poll: 1000, // Use polling (useful for network filesystems)
    },
};
