const webpack = require('webpack')

module.exports = {
    entry: ['./main.js', './main_edit.js'],
    output: {
        path: './',
        filename: './dist/0.0.1/edit-card.min.js',
    },
    node: {
        net: 'empty',
        tls: 'empty',
        fs: 'empty'
    },
    devServer: {
      disableHostCheck: true
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        '../../lib/js/react-jsonschema-form': 'JSONSchemaForm',
        'axios': 'axios'
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
            },
            {
                test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader?name=src/fonts/[name].[ext]'
            }
        ]
    }
};
