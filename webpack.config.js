const path = require('path');

const nodeModulesPath = path.resolve(__dirname, 'node_modules');

module.exports = {
    entry: './src/js/bundle.js',
    output: {
        path: __dirname + '/build',
        filename: 'server.js',
    },
    target: 'node',
    module: {
        preLoaders: [
            { test: /\.json$/, loader: 'json'},
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: ['babel'],
                query: {
                    presets: ['es2016', 'es2015'],
                    plugins: [
                        'transform-class-properties',
                        'transform-es2015-modules-commonjs',
                        'transform-es2015-arrow-functions'
                    ]
                },
                exclude: [nodeModulesPath]
            }
        ]
    }
};
