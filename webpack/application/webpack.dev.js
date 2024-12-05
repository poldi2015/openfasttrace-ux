const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common');

//Configure dev enviroment by using common configuration and adding some more options
module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',      // separate source map file to deminimize code for debugger

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
    ]
})