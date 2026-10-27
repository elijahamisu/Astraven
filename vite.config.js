import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, statSync, existsSync } from 'fs';

function getHtmlInputs() {
  const inputs = {};
  
  // Scan root directory for HTML files
  const rootFiles = readdirSync(__dirname);
  rootFiles.forEach(file => {
    if (file.endsWith('.html')) {
      const name = file.replace(/\.html$/, '');
      inputs[name] = resolve(__dirname, file);
    }
  });

  // Scan admin directory if present
  const adminDir = resolve(__dirname, 'admin');
  if (existsSync(adminDir)) {
    const adminFiles = readdirSync(adminDir);
    adminFiles.forEach(file => {
      if (file.endsWith('.html')) {
        const name = `admin_${file.replace(/\.html$/, '')}`;
        inputs[name] = resolve(adminDir, file);
      }
    });
  }

  return inputs;
}

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: getHtmlInputs()
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
