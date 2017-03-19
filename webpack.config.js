var webpack = require("webpack");
var path = require('path');

module.exports = {
   entry: {
      app: './client/main.js'
   },
   output: {
      filename: 'build/bundle.js',
      sourceMapFilename: 'build/bundle.map'
   },
   devtool: 'source-map',
   module: {
      loaders: [{
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
               presets: ['es2015', 'stage-0']
            }
         }, 
         // {
         //    test: /\.css$/,
         //    loader: 'style-loader!css-loader!postcss-loader'
         // }, 
         // {
         //    test: /\.(jpg|png|svg)$/,
         //    exclude: /icons/,
         //    loader: 'file?name=media/[name].[ext]'
         // }

      ]
   },
	 // postcss: () => {
  //    return {defaults: [ impy, autoprefixer, mixins, cssnext ]}
  //  }
}
