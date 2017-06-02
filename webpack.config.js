const webpack = require('webpack')

module.exports = {
    entry: './main.js',
    output: {
        library: 'Quiz',
        path: './',
        filename: 'index.js',
    },
    // plugins: [
       // new webpack.optimize.UglifyJsPlugin()
    // ],
    node: {
        net: 'empty',
        tls: 'empty',
        fs: 'empty'
    },
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
            }
        ]
    }
};
