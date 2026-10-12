import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {createSevakPhotoRouter} from './server/photo-upload.mjs';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), {
      name: 'sevak-photo-api',
      configureServer(server) {
        const api = createSevakPhotoRouter({
          supabaseUrl: env.VITE_SUPABASE_URL || '',
          publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '',
          imageDirectory: path.resolve(process.cwd(), 'public/sample-sevak'),
        });
        const invokeApi = api as unknown as (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: (error?: Error) => void) => void;
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/api/sevak-profile-photo')) return next();
          invokeApi(req, res, next);
        });
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
