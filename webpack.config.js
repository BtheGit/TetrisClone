var webpack = require("webpack");
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
   entry: {
      app: './client/main.js'
   },
   output: {
      path: 'dist',
      filename: 'bundle.js',
      sourceMapFilename: 'bundle.map'
   },
   devtool: 'source-map',
   plugins: [
      new HtmlWebpackPlugin({
         filename: 'index.html',
         template: 'client/index.html'
      }),
   ],
   module: {
      loaders: [{
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
               presets: ['es2015', 'stage-0']
            }
         }, 
         {
            test: /\.html$/,
            loader: 'html-loader'
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
