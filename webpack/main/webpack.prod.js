const {merge} = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common');

//Configure prod enviroment by using common configuration and adding some more options
module.exports = merge(common, {
    mode: 'production',
    devtool: false,

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ]
})