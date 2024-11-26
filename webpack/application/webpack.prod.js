const { merge } = require('webpack-merge');
const common = require('./webpack.common');

//Configure prod enviroment by using common configuration and adding some more options
module.exports = merge(common, {
    mode: 'production',
    devtool: false
})