import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,          // container ke bahar se access allow
    port: 5174,          // ensure Vite isi port pe chale
    strictPort: true     // force it to use 5174 only
  }
});
