const { resolve } = require('path')

module.exports = {
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'jam/index.html'),
      },
    },
  },
}
