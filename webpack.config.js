const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = env => {
    const entry = (env === 'no-sagas') ?
        path.join(__dirname, 'src', 'no-sagas', 'index.tsx') :
        path.join(__dirname, 'src', 'index.tsx');
    return {
        entry,
        output: {
            path: path.join(__dirname, 'dist'),
            filename: '[name].js'
        },
        mode: 'development',
        module: {
            rules: [{
                test: /\.tsx?$/,
                loader: 'ts-loader',
            }, {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            }, {
                test: /\.(jpeg|svg|eot|png|woff2|woff|ttf)$/,
                loader: 'url-loader',
            }],
        },
        resolve: {
            alias: {
                src: path.join(__dirname, 'src'),
                assets: path.join(__dirname, 'assets'),
            },
            extensions: ['.js', '.ts', '.tsx'],
        },
        devServer: {
            hot: true,
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'src', 'index.html')
            }),
            new webpack.HotModuleReplacementPlugin(),
        ]
    };
};
