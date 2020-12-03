const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { port } = require("./package.json");
const HOST = process.env.HOST || "prod.foo.redhat.com";
const PORT = process.env.PORT || port;
const PROTOCOL = process.env.PROTOCOL || "https";

module.exports = merge(common('development'), {
  mode: "development",
  devtool: "eval-source-map",
  output: {
    // This must be set explicitly for module federation
    publicPath: `${PROTOCOL}://${HOST}:${PORT}/`
  },
  devServer: {
    contentBase: "./dist",
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    open: true,
    https: PROTOCOL === "https"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/base.css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css')
        ],
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/keycloak.dev.json', to: 'keycloak.json'}
      ]
    }),
    new webpack.DefinePlugin({
      "__BASE_PATH__": process.env.BASE_PATH || 'https://api.stage.openshift.com'
    }),
  ]
});
