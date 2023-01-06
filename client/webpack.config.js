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

const webResolveSettings = {
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
};

module.exports = [
  {
    /**
     * 記事ページ以外の画面からWebサイトにアクセスする場合のソースの作成
     * クライアントレンダリングだけで画面を作成する仕様になっている
     */
    target: "web",
    mode: "production",
    entry: path.resolve(__dirname, `./src/clientSideRender.tsx`),
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
        __RenderOn__: '"Client"',
      }),
    ],
    externals: [],
    ...moduleSettings,
    ...webResolveSettings,
    output: {
      publicPath: "/",
      path: path.resolve(__dirname, "dist"), //バンドルしたファイルの出力先のパスを指定
      filename: "clientSideRender.js", //出力時のファイル名の指定
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
    /**
     * 記事ページ画面からWebサイトにアクセスする場合のソースの作成
     * 記事ページの初回ロードはReactのhydrateをつかってサーバーサイドレンダリングに対応している
     */
    target: "web",
    mode: "production",
    entry: path.resolve(__dirname, `./src/serverSideRender.tsx`),
    plugins: [
      new HtmlWebpackPlugin({
        inject: "body",
        template: path.resolve(__dirname, `src/index.html`),
        filename: path.resolve(__dirname, `dist/article_template.html`),
      }),
      new MiniCssExtractPlugin(),
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
      new Dotenv(),
      new webpack.DefinePlugin({
        __RenderOn__: '"Client"',
      }),
    ],
    externals: [],
    ...moduleSettings,
    ...webResolveSettings,
    output: {
      publicPath: "/",
      path: path.resolve(__dirname, "dist"), //バンドルしたファイルの出力先のパスを指定
      filename: "serverSideRender.js", //出力時のファイル名の指定
    },
    optimization: {
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin({
          parallel: true,
        }),
      ],
    },
  },
  {
    /**
     * サーバーサイドで用いるテンプレートのhtmlを生成するスクリプト
     */
    mode: "production",
    entry: "./src/insertPageContent.tsx",
    target: "node",
    externalsPresets: { node: true },
    externals: [
      NodeExternals({
        // node_modules配下のcssをbundleに含めるようにする設定
        allowlist: [cssRegex],
      }),
    ],
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "insertPageContent.js",
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
        __RenderOn__: '"Server"',
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ],
  },
];
