import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Changes on every build: added to preview video/poster URLs so a new deploy never shows cached old previews.
    __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
  server: {
    port: 5180,
    host: true,
    open: true
  }
});
