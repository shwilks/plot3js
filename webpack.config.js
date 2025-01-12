const path = require('path');

module.exports = {
    entry: './src/viewer.js',
    output: {
        path: path.resolve(__dirname, 'dist'), // Recommended: Absolute path
        filename: 'main.js',
        library: 'R3JS',
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    externals: {
      shiny: 'Shiny'
    }
};
