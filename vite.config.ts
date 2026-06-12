import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
    assetsInlineLimit: 2048,
    rollupOptions: {
      input: {
        app: 'index.html',
        engine: 'src/main.ts',
      },
      output: {
        manualChunks: {
          pixi: ['pixi.js'],
          audio: ['howler'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
