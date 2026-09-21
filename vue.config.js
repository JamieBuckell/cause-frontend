const path = require("path");
const packageVersion = require("./package.json").version;

const buildVersion =
  process.env.VUE_APP_BUILD_VERSION || `${packageVersion}-${Date.now()}`;

class BuildVersionPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap("BuildVersionPlugin", (compilation) => {
      const contents = JSON.stringify({ version: buildVersion });
      compilation.assets["version.json"] = {
        source: () => contents,
        size: () => contents.length,
      };
    });
  }
}

function resolveSrc(_path) {
  return path.join(__dirname, _path);
}
module.exports = {
  chainWebpack(config) {
    config.plugin("define").tap((args) => {
      args[0]["process.env"].VUE_APP_BUILD_VERSION = JSON.stringify(
        buildVersion
      );
      return args;
    });

    // S3 needs an object at this exact history-mode URL to return HTTP 200.
    config.plugin("registration-html").use(require("html-webpack-plugin"), [
      {
        ...config.plugin("html").get("args")[0],
        filename: "donors/register",
      },
    ]);
  },
  configureWebpack: {
    plugins: [new BuildVersionPlugin()],
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
