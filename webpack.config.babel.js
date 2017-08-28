import webpack from 'webpack';
import path from 'path';
const distDir = path.join(__dirname, 'public/dist');

const config = {
  entry: './bot/bot',
  output: {
    path: distDir,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.join(__dirname, 'bot/'),
        exclude: ['node_modules'],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['react', 'es2015', 'stage-2']
            }
          }
        ]
      }
    ]
  },
  target: 'node',
  devtool: 'source-map'
  // plugins: [new webpack.HotModuleReplacementPlugin()],
  // devServer: {
  //   contentBase: distDir,
  //   filename: 'bundle.js',
  //   compress: true,
  //   port: 3000,
  //   historyApiFallback: true,
  //   hot: true
  // }
};

export default config;
