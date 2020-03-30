'use strict';

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const CleanPlugin = require('./utils/clean-plugin');
const NodeUtils = require('./src/services/common/node-service');

const appConfig = require('./config/config');

const APP_DIR = path.join(__dirname, 'src');

/**
 * Get webpack plugins
 * @returns {*[]}
 */
function getPlugins () {
  return [
    // Clear the output dir before builds
    new CleanPlugin({
      files: ['public/*']
    }),

    // Extract CSS to a separate file
    new MiniCssExtractPlugin({
      filename: !NodeUtils.isDevelopment() ? '[name].[hash].css' : '[name].css',
      chunkFilename: !NodeUtils.isDevelopment() ? '[id].[hash].css' : '[id].css'
    }),

    // Ignore moment locales
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    // Inject bundles and CSS directly into the HTML template
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      inject: 'body'
    }),

    // Pass NODE_ENV and APP_CONFIG to application
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(
          process.env.NODE_ENV
        ),
        APP_CONFIG: JSON.stringify(
          appConfig
        )
      }
    })
  ];
}

function getCodeSplittingConfig () {
  return {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial'
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    },
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          ecma: 8,
          mangle: false,
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  };
}

/**
 * Get Webpack file parsing rules
 * @returns {*[]}
 */
function getParserRules () {
  const devSassLoaders = ['style-loader', 'css-loader', 'sass-loader'];

  // Extract CSS and autoprefix
  const prodSassLoaders = [
    MiniCssExtractPlugin.loader, 'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [
          autoprefixer({
            browsers: ['last 2 version']
          })
        ]
      }
    }, 'sass-loader'];

  return [
    {
      test: /\.(js|jsx)$/,
      loaders: 'babel-loader',
      include: APP_DIR
    },
    { test: /\.scss/, exclude: /node_modules/, loader: 'style!css?modules&importLoaders=2&sourceMap&localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded&sourceMap&includePaths[]=node_modules/compass-mixins/lib'},
    { test: /\.css$/, loader: 'style-loader!css-loader' },
    {
      test: /\.scss$/,
      use: !NodeUtils.isDevelopment() ? prodSassLoaders : devSassLoaders,
      include: APP_DIR
    },
    {
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|otf|ttc)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader?limit=10000&name=[name]-[hash].[ext]',
      include: APP_DIR
    },
    {
      test: /\.ico$/,
      loader: 'file-loader?name=[name].[ext]'
    },
    {
      test: /\.json$/,
      loader: 'json-loader',
      include: APP_DIR
    }
  ];
}

const webpackConfig = {};

// Configure the output directory and bundle name
webpackConfig.output = {
  path: path.join(__dirname, 'public'),
  filename: '[name].[hash].js'
};

// Allow webpack to automatically resolve import extensions
webpackConfig.resolve = {
  extensions: ['.js', '.jsx', '.json', '.html', '.css']
};

// Set up code splitting
webpackConfig.optimization = getCodeSplittingConfig();

// Set webpack plugins
webpackConfig.plugins = getPlugins();

// Set up file parsing rules
webpackConfig.module = {
  rules: getParserRules()
};

// Add additional configurations based on NODE_ENV
if (!NodeUtils.isDevelopment()) {
  webpackConfig.entry = './src/Bootstrap';
  webpackConfig.mode = 'production';
} else {
  webpackConfig.devtool = 'eval';
  webpackConfig.mode = 'development';
  webpackConfig.entry = [
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://localhost:${appConfig.easypay.port}`,
    'webpack/hot/only-dev-server',
    './src/Bootstrap'
  ];
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
}

module.exports = webpackConfig;
