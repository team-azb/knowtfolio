const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");

const path = require("path");
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

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
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new Dotenv(),
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
        test: cssRegex,
        exclude: cssModuleRegex,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: cssModuleRegex,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                exportLocalsConvention: "camelCase",
              },
            },
          },
        ],
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
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      url: require.resolve("url"),
    },
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
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
