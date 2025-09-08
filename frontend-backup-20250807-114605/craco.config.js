const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  devServer: {
    port: 3000,
    host: '0.0.0.0',
    hot: true,
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
  },
}; 