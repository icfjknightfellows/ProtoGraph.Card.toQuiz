const webpack = require('webpack')

module.exports = {
    entry: './main.js',
    output: {
        path: './',
        filename: './dist/0.0.1/card.min.js',
    },
    node: {
        net: 'empty',
        tls: 'empty',
        fs: 'empty'
    },
    devServer: {
      disableHostCheck: true
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query:
                {
                    presets:['react']
                }
            },
            {
                test: /\.scss$/,
                loaders: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader?name=src/fonts/[name].[ext]'
            }
        ]
    }
};
