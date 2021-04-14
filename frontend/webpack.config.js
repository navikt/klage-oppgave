const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
module.exports = {
  entry: {
    main: "./src/index.tsx",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                strictMath: true,
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
            options: {
              publicPath: "/",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: "node_modules/pdfjs-dist/build/pdf.worker.js",
          to: "pdf.worker.js",
        },
      ],
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, "public"),
    hot: true,
    host: "0.0.0.0",
    port: 8060,
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "http://apimock:3000",
        pathRewrite: { "^/api": "" },
      },
      "/internal": {
        target: "http://nodefront:8090",
      },
      "/me": {
        target: "http://apimock:3000",
      },
    },
  },
};
