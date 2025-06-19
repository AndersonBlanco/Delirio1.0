// metro.config.js (Expo)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('tflite'); // Add any custom file extensions you need

module.exports = config;
