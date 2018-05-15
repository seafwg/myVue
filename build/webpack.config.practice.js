const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const merge = require("webpack-merge");
const baseConfig = require("./webpack.config.base");

let config;
const defaultPlugins = [
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '"development"'
        }
    }),
    new HTMLPlugin({
        template: path.join(__dirname,"template.html")
    })
];
const devServer = {
    port: 8098,
    host: '0.0.0.0',
    overlay: {
        errors: true,
    },
    hot: true
};

config = merge(baseConfig, {//合并到baseConfig文件中
    entry: path.join(__dirname,"../practice/index.js"),
    devtool: '#cheap-module-eval-source-map',
    module: {
        rules: [
            {
                test: /\.styl/,
                use: [
                    'vue-style-loader',
                    {
                        loader: "css-loader",
                        options: {
                            module: true,
                            localIdentName: "[path]-[name]-[hash:base64:5]"
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                    'stylus-loader'
                ]
            }
        ]
    },
    devServer,
    resolve: {
        alias: {//指定import vue的js文件
            "vue": path.join(__dirname,"../node_modules/vue/dist/vue.esm.js")
        }
    },
    plugins: defaultPlugins.concat([
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ])
});
module.exports = config
