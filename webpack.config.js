const path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin")


module.exports = {
  mode: "development",
  entry: [
    './src/index.js',
    "./src/index.css"
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use:[
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename:"bundle.css"
    })
  ],

};
