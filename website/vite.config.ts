import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  assetsInclude: ['**/*.md'],
  root: resolve(__dirname),
  publicDir: resolve(__dirname, '../public'),
  build: {
    outDir: resolve(__dirname, '../doc'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库单独分割
          'react-vendor': ['react', 'react-dom'],
          // UI 组件库分割
          'markdown-vendor': ['@uiw/react-markdown-preview'],
          'uiw-components': [
            '@uiw/react-github-corners',
            '@uiw/react-shields',
            '@uiw/react-mac-keyboard'
          ],
          // 主题和样式相关
          'theme-vendor': ['@wcj/dark-mode'],
        },
        // 自定义chunk命名和文件结构
        chunkFileNames: () => {
          return `assets/[name].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 启用更好的压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除console.log
        drop_debugger: true,
      },
    },
    // 启用source map用于调试
    sourcemap: false, // 生产环境关闭source map减少文件大小
  },
  resolve: {
    alias: {
      '@': resolve(__dirname),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
