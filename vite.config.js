import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    watch: {
      ignored: ['**/node_modules_broken/**', '**/.git-broken-*/**', '**/dist/**', '**/.next/**'],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.jsx',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/App.jsx',
        'src/lib/api.js',
        'src/pages/shared/VideoCallPage.jsx',
        'src/assets/**',
        'src/data/**',
        'src/test/**',
        'src/**/*.test.{js,jsx}',
      ],
      thresholds: {
        statements: 85,
        lines: 85,
        functions: 85,
      },
    },
  },
});
