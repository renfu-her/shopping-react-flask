import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Gzip 壓縮
        viteCompression({
          verbose: true,
          disable: !isProduction,
          threshold: 10240, // 10KB 以上才壓縮
          algorithm: 'gzip',
          ext: '.gz',
          deleteOriginFile: false,
        }),
        // Brotli 壓縮（更高壓縮率）
        viteCompression({
          verbose: true,
          disable: !isProduction,
          threshold: 10240,
          algorithm: 'brotliCompress',
          ext: '.br',
          deleteOriginFile: false,
        }),
        // 打包分析工具（生產模式）
        isProduction && visualizer({
          filename: './dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // 啟用/禁用 minification
        minify: 'terser',
        // Terser 配置
        terserOptions: {
          compress: {
            drop_console: isProduction, // 生產環境移除 console
            drop_debugger: isProduction,
            pure_funcs: isProduction ? ['console.log', 'console.info'] : [],
          },
        },
        // CSS 代碼分割
        cssCodeSplit: true,
        // Source map（開發時開啟，生產環境可選）
        sourcemap: !isProduction,
        // 優化輸出
        reportCompressedSize: true,
        rollupOptions: {
          output: {
            // 靜態資源分類打包
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];
              if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
                return 'assets/images/[name]-[hash][extname]';
              }
              if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
                return 'assets/fonts/[name]-[hash][extname]';
              }
              if (/\.css$/i.test(assetInfo.name)) {
                return 'assets/css/[name]-[hash][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            },
            manualChunks(id) {
              // Vendor libraries
              if (id.includes('node_modules')) {
                // React core
                if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                  return 'react-vendor';
                }
                // Google GenAI SDK
                if (id.includes('@google/genai')) {
                  return 'genai-vendor';
                }
                // Markdown rendering
                if (id.includes('react-markdown')) {
                  return 'markdown-vendor';
                }
                // UI icons
                if (id.includes('lucide-react')) {
                  return 'icons-vendor';
                }
                // Other node_modules
                return 'vendor';
              }
              // Split large service files
              if (id.includes('services/api')) {
                return 'api-services';
              }
              // Split context files
              if (id.includes('context/')) {
                return 'context';
              }
            },
          },
        },
        chunkSizeWarningLimit: 600,
      },
      // CSS 優化
      css: {
        devSourcemap: !isProduction,
      },
      // 優化依賴預構建
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@google/genai',
          'lucide-react',
          'react-markdown'
        ],
      },
    };
});
