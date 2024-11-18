module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        // Adding the polyfill for the 'assert' module
        webpackConfig.resolve.fallback = {
          ...webpackConfig.resolve.fallback,
          assert: require.resolve('assert/'),
        };
        return webpackConfig;
      },
    },
  };
  