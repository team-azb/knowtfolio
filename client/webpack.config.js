const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const NodeExternals = require("webpack-node-externals");
const webpack = require("webpack");

const path = require("path");
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

const moduleSettings = {
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
};

module.exports = [
  {
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
      new webpack.DefinePlugin({
        __isBrowser__: true,
      }),
    ],
    externals: [],
    ...moduleSettings,
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
      publicPath: "/",
      path: path.resolve(__dirname, "dist"), //バンドルしたファイルの出力先のパスを指定
      filename: "main.js", //出力時のファイル名の指定
    },
    optimization: {
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin({
          parallel: true,
        }),
      ],
    },
    devServer: {
      historyApiFallback: {
        rewrites: [{ from: /^\/*/, to: "/index.html" }],
      },
      port: 3000,
      proxy: [
        {
          context: "/api/signup",
          changeOrigin: true,
          target: "https://knowtfolio.com",
        },
        {
          context: (path) => {
            if (path.includes("/api")) {
              return true;
            } else if (/\/articles\/.+/.test(path)) {
              const editMatcher = /\/articles\/.+\/edit/g;
              return (
                !path.includes("/articles/new") && !path.match(editMatcher)
              );
            } else {
              return false;
            }
          },
          target: "http://server:8080",
        },
      ],
    },
  },
  {
    mode: "production",
    entry: "./src/createArticleTemplate.tsx",
    target: "node",
    externalsPresets: { node: true },
    externals: [NodeExternals()],
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "createArticleTemplate.js",
    },
    ...moduleSettings,
    resolve: {
      modules: ["node_modules"],
      extensions: [".js", ".ts", ".tsx", ".json"],
      alias: {
        "~": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new Dotenv(),
      new webpack.DefinePlugin({
        __isBrowser__: false,
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ],
  },
];
