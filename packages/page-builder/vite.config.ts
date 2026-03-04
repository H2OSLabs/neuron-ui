import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@neuron-ui/tokens': path.resolve(__dirname, '../tokens'),
      '@neuron-ui/components': path.resolve(__dirname, '../components'),
      '@neuron-ui/runtime': path.resolve(__dirname, '../runtime'),
      '@neuron-ui/metadata': path.resolve(__dirname, '../metadata'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
