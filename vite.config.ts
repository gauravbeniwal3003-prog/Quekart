import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const imgbbKey = env.VITE_IMGBB_API_KEY || env.IMGBB_API_KEY || process.env.VITE_IMGBB_API_KEY || process.env.IMGBB_API_KEY || '';
  const backendUrl = env.VITE_BACKEND_URL || env.VITE_API_URL || env.BACKEND_URL || process.env.VITE_BACKEND_URL || process.env.VITE_API_URL || '';

  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'process.env.IMGBB_API_KEY': JSON.stringify(imgbbKey),
      'process.env.BACKEND_URL': JSON.stringify(backendUrl),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.VITE_IMGBB_API_KEY': JSON.stringify(imgbbKey),
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(backendUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
