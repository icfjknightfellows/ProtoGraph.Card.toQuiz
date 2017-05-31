const webpack = require('webpack')

module.exports = {
    entry: './main.js',
    output: {
        path: './',
        filename: 'index.js',
    },
    // plugins: [
	   // new webpack.optimize.UglifyJsPlugin()
    // ],
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
            }
        ]
    }
};
