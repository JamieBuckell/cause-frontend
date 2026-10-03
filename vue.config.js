const path = require("path");
const packageVersion = require("./package.json").version;

const deploymentEnvironment = process.env.VUE_APP_ENVIRONMENT || "live";
if (!["dev", "live"].includes(deploymentEnvironment)) {
  throw new Error(`Unknown deployment environment: ${deploymentEnvironment}`);
}
const commit = process.env.VUE_APP_COMMIT_SHA ||
  require("child_process").execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();

const buildVersion =
  process.env.VUE_APP_BUILD_VERSION || `${packageVersion}-${deploymentEnvironment}-${commit.slice(0, 7)}-${Date.now()}`;

class BuildVersionPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap("BuildVersionPlugin", (compilation) => {
      // Apply to every HTML entry point, including copied utility pages and
      // the extensionless registration page. Crawlers must be able to read
      // this directive, so do not block these pages through robots.txt.
      if (deploymentEnvironment === "dev") {
        const robots = '<meta name="robots" content="noindex, nofollow, noarchive, noimageindex">';
        for (const [filename, asset] of Object.entries(compilation.assets)) {
          if (!filename.endsWith(".html") && filename !== "donors/register") {
            continue;
          }
          const html = asset.source().toString();
          const contents = /<head(?:\s[^>]*)?>/i.test(html)
            ? html.replace(/<head(?:\s[^>]*)?>/i, `$&${robots}`)
            : `<head>${robots}</head>${html}`;
          compilation.assets[filename] = {
            source: () => contents,
            size: () => Buffer.byteLength(contents),
          };
        }
      }

      const contents = JSON.stringify({ version: buildVersion, environment: deploymentEnvironment, commit });
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
