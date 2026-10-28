import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';

function getHtmlInputs() {
  const inputs = {};
  
  // 1. Root directory HTML pages
  const rootFiles = readdirSync(__dirname);
  rootFiles.forEach(file => {
    if (file.endsWith('.html')) {
      const name = file.replace(/\.html$/, '');
      inputs[name] = resolve(__dirname, file);
    }
  });

  // 2. Admin directory HTML pages
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
