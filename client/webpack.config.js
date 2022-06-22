const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const path = require("path");

module.exports = {
  target: "web",
  mode: "production",
  entry: path.resolve(__dirname, `./src/index.tsx`),
  plugins: [
    new HtmlWebpackPlugin({
      inject: "body",
      template: path.resolve(__dirname, `src/index.html`),
      filename: path.resolve(__dirname, `dist/index.html`),
    }),
    new MiniCssExtractPlugin(),
  ],
  externals: [],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".ts", ".tsx"],
    fallback: { util: false },
  },
  output: {
    path: path.resolve(__dirname, "dist"), //バンドルしたファイルの出力先のパスを指定
    filename: "main.js", //出力時のファイル名の指定
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  devServer: {
    historyApiFallback: {
      rewrites: [{ from: /^\/*/, to: "/index.html" }],
    },
    port: 3000,
  },
};
