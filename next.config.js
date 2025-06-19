/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, options) => {
    config.experiments = {...config.experiments, topLevelAwait: true };
    config.resolve.alias = {...config.resolve.alias, ...{
        fs: false,
      }};

    return config
  },
}

module.exports = nextConfig
