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
