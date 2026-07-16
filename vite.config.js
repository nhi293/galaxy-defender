import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1500, // Phaser is large, increase limit
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'] // Splitting phaser into its own chunk
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
