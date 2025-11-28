import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
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
    };
});
