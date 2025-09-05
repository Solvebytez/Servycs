const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add support for CSS files
config.resolver.assetExts.push("css");

// Add path mapping support
config.resolver.alias = {
  "@": path.resolve(__dirname, "."),
};

module.exports = config;
