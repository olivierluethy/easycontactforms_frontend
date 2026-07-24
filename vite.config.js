import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const widgetRoot = path.resolve(__dirname, '../easycontactforms_widget');

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve `@easycontact/react` to the local widget source so the live
    // preview in ProjectDetail uses exactly the same component consumers
    // import after `pnpm add @easycontact/react`. The path points at the
    // raw JSX entry so changes show up on hot reload without rebuilding.
    alias: {
      '@easycontact/react': path.resolve(widgetRoot, 'src/index.js'),
    },
  },
  server: {
    port: 5173,
    // Vite's default fs.allow is just the project root; expand it to include
    // the sibling easycontactforms_widget/ directory so the alias above can be
    // imported.
    fs: { allow: [path.resolve(__dirname, '..')] },
  },
  test: {
    // jsdom so component tests can render; pure util tests don't care either way.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
});
