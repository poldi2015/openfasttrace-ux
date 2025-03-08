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

const {merge} = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common');
const ZipPlugin = require("zip-webpack-plugin");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const path = require('path');
const {pathToFileURL} = require('url');
const os = require('os');

const MAVEN_LOCAL_URL = pathToFileURL(path.join(os.homedir(), '.m2/repository')).href;
const DISTRIBUTION_BUILD_PATH = 'publications';
const APPLICATION_ARTIFACT = 'openfasttrace-ux.zip';

//Configure dev environment by using common configuration and adding some more options
module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',      // separate source map file to deminimize code for debugger

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new ZipPlugin({
            path: `../${DISTRIBUTION_BUILD_PATH}`,
            filename: APPLICATION_ARTIFACT,
        }),
        new WebpackShellPluginNext({
            onAfterDone: {
                scripts: [
                    `mvn deploy:deploy-file \
                         -Durl=${MAVEN_LOCAL_URL} \
                         -Dfile=build/${DISTRIBUTION_BUILD_PATH}/${APPLICATION_ARTIFACT} \
                         -DgroupId=org.itsallcode \
                         -DartifactId=openfasttrace-ux \
                         -Dversion=0.1.0`
                ],
                blocking: false,
                parallel: false
            }
        }),
    ]
})