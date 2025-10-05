import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tsconfigPaths() // apply aliases from tsconfig.app.json
  ],
  build: {
    assetsInlineLimit: 8192 // assests less than 8 kB will be loaded as data: urls
  },
})
