import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@neuron-ui/tokens': path.resolve(__dirname, '../tokens'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
