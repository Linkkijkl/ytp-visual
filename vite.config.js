import { resolve
} from 'path'
import { defineConfig
} from 'vite'

export default defineConfig
({
 build: {
   rollupOptions: {
     input: {
       main: resolve(__dirname, 'index.html'),
       en: resolve(__dirname, 'en/index.html'),
     },
   },
 },
})