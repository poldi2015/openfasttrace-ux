const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
//const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/main/js/openfasttrace_view.js', // Main entry point for your JavaScript files
  output: {
    filename: 'openfasttrace.min.js',   // Output bundle
    path: path.resolve(__dirname, 'build/dist'), // Output directory
    clean: true, // Automatically clean the output directory
  },
  externals: {
    jquery: 'jQuery',
  },
  mode: 'development', // Production mode enables minification
  devtool: 'inline-source-map', // Enable source maps
  watch: true, // Enable watch mode
  watchOptions: {
    ignored: /node_modules/, // Ignore node_modules for performance
    aggregateTimeout: 300, // Delay rebuild after the first change (ms)
    poll: 1000, // Use polling (useful for network filesystems)
  },
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
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // Extract and load CSS
      },
      {
        test: /\.html$/,
        use: 'html-loader', // Load and minify HTML files
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve these file extensions
  },
  plugins: [
    new CleanWebpackPlugin(), // Clean the output directory before each build
    new HtmlWebpackPlugin({
      template: './src/main/html/openfasttrace_view.html', // Input HTML file
      inject: 'body',
      scriptLoading: 'defer',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        //minifyCSS: true,
        //minifyURLs: true,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'libs', to: 'libs' }, // Copy all libraries to the dist/libs folder
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css', // Extracted CSS filename
    }),
/*
    new ESLintPlugin({
      extensions: ['ts', 'js'], // Run ESLint on TypeScript and JavaScript files
    }),
*/
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(), // Minify JavaScript
      //new CssMinimizerPlugin(), // Minify CSS
    ],
  },
};
