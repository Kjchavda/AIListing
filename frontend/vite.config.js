import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  // 1. Add the React plugin
  plugins: [react()],

  // 2. Set up a handy path alias for your 'src' folder
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
