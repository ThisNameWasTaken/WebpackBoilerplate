// NodeJS modules
const path = require('path');

// Webpack modules
const webpack = require('webpack');

// Webpack plugins
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// Environment constants
const IS_PROD = process.argv.includes('production');
const IS_DEV = !IS_PROD;

// Configuration constants
const SASS_CONFIG = {
    // Transpile sass into css and minify it
    PROD: ExtractTextPlugin.extract({ fallback: 'style-loader', use: [{ loader: 'css-loader', options: { minimize: IS_PROD } }, 'postcss-loader', 'sass-loader'] }),

    // Do not use the `ExtractTextPlugin` in development since it does not work with the `HotModuleReplacement` plugin
    DEV: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
};

const IMAGE_CONFIG = {
    // Load images
    PROD: [
        { loader: 'file-loader', options: { name: 'images/[name].[ext]' } },
        {
            // And compress them
            loader: 'image-webpack-loader',
            options: {
                mozjpeg: { // https://github.com/imagemin/imagemin-mozjpeg
                    progressive: true,
                    quality: 65,
                    dcScanOpt: 2
                },
                // optipng.enabled: false will disable optipng
                optipng: { // https://github.com/imagemin/imagemin-optipng
                    optimizationLevel: 7,
                    enabled: false
                },
                pngquant: { // https://github.com/imagemin/imagemin-pngquant
                    quality: '75-85',
                    speed: 1
                },
                gifsicle: { // https://github.com/imagemin/imagemin-gifsicle
                    interlaced: true,
                    optimizationLevel: 3
                },
                // the webp option will enable WEBP
                webp: { // https://github.com/imagemin/imagemin-svgo
                    quality: 65
                }
            }
        }],

    // Load images but skip compression
    DEV: [{ loader: 'file-loader', options: { name: 'images/[name].[ext]' } }]
}

let plugins = [
    // Load html
    new HTMLWebpackPlugin({
        inject: false,
        template: 'src/index.html',
        filename: 'index.html',
        // Minify in production
        minify: {
            removeComments: IS_PROD,
            removeCommentsFromCDATA: IS_PROD,
            removeCDATASectionsFromCDATA: IS_PROD,
            collapseWhitespace: IS_PROD,
            minifyJS: IS_PROD,
            minifyCSS: IS_PROD,
            keepClosingSlash: IS_PROD,
            removeScriptTypeAttributes: IS_PROD,
            removeStyleTypeAttributes: IS_PROD
        }
    })
];

if (IS_PROD) {
    plugins.push(
        // Clean the `dist` folder when building
        new CleanWebpackPlugin('dist')
    );


    plugins.push(
        // Extract css
        new ExtractTextPlugin({
            filename: 'css/[name].css',
            allChunks: true
        })
    );
}

if (IS_DEV) {
    // Plugins for hot reloading
    plugins.push(new webpack.NamedModulesPlugin());
    plugins.push(new webpack.HotModuleReplacementPlugin());
    plugins.push(reloadHTML);
}

// The `HotModuleReplacement` plugin does not detect changes made by the `HTMLWebpackPlugin`
// This variable is used to override that behaviour
let devServer;

module.exports = {
    entry: './src/js/main.js',
    output: {
        // Output everything inside the `dist` folder
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/main.js'
    },
    module: {
        rules: [
            {
                // Load html files
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                // Transpile ES6
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                // Transpile sass to css
                test: /\.(scss|sass)$/,
                use: IS_PROD ? SASS_CONFIG.PROD : SASS_CONFIG.DEV
            },
            {
                // Load images
                test: /\.(gif|png|jpg|jpeg|svg|webp)$/i,
                // During development skip image compression
                use: IS_PROD ? IMAGE_CONFIG.PROD : IMAGE_CONFIG.DEV
            }
        ]
    },
    plugins: plugins,
    devServer: {
        contentBase: './dist',
        port: 8080,
        hot: true,      // enable Hot Module Replacement
        compress: true, // enable gzip
        open: true,     // open in a new browser window
        before(app, server) {
            devServer = server;
        }
    },
    // Use source maps in production
    devtool: IS_PROD ? 'source-map' : ''
};

/**
 * Special thanks to:  
 * avdd - https://github.com/avdd   
 * Sebastian Seilund - https://github.com/sebastianseilund
 * 
 * Source: https://github.com/jantimon/html-webpack-plugin/issues/100
 */
function reloadHTML() {
    const cache = {};
    const plugin = { name: 'CustomHTMLReloadPlugin' };
    this.hooks.compilation.tap(plugin, compilation => {
        compilation.hooks.htmlWebpackPluginAfterEmit.tap(plugin, data => {
            const orig = cache[data.outputName];
            const html = data.html.source();
            // plugin seems to emit on any unrelated change?
            if (orig && orig !== html) {
                devServer.sockWrite(devServer.sockets, 'content-changed');
            }
            cache[data.outputName] = html;
        })
    })
}
