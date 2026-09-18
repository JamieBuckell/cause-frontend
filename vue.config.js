const path = require("path");
function resolveSrc(_path) {
  return path.join(__dirname, _path);
}
module.exports = {
  chainWebpack(config) {
    // S3 needs an object at this exact history-mode URL to return HTTP 200.
    config.plugin("registration-html").use(require("html-webpack-plugin"), [
      {
        ...config.plugin("html").get("args")[0],
        filename: "donors/register",
      },
    ]);
  },
  configureWebpack: {
    // Set up all the aliases we use in our app.
    resolve: {
      alias: {
        src: resolveSrc("src"),
        assets: resolveSrc("src/assets"),
      },
    },
  },
  devServer: {
    disableHostCheck: true,
    port: 4000,
    public: "0.0.0.0:4000",
  },
  css: {
    // Enable CSS source maps.
    sourceMap: true,
  },
};
