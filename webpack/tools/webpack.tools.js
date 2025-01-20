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
/*
  OpenFastTrace UX

 Copyright (C) 2016 - 2024 itsallcode.org

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
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const __base = path.resolve(__dirname, '../..');
const __src = path.resolve(__base, 'src/tools');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    target: 'node',

    // Javascript and ts minimization source trees
    entry: {
        gen_model: path.resolve(__src, 'js/gen_model.ts')
    },
    output: {
        filename: '[name]/js/[name].js',
        path: path.resolve(__base, 'build/tools'),
        clean: true,
    },

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
    plugins: [
        new CleanWebpackPlugin(), // Clean the output directory before each build
    ],
    resolve: {
        extensions: ['.ts', '.js'], // Resolve these file extensions
    },

};
