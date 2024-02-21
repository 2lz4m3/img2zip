import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  /* eslint @typescript-eslint/no-unsafe-member-access: 'off' */
  base: process.env.GITHUB_PAGES ? '/img2zip/' : '/',
  plugins: [react()],
})
