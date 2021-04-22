const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = merge(common('production', { mode: "production" }), {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
    ],
  },
  output: {
    filename: '[name].[contenthash:8].js'
  },
});
