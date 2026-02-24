import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // เช็คว่ากำลัง Build โดยใช้ GitHub Actions หรือไม่
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    // ถ้าเป็น GitHub Actions ให้ใช้ '/Pre-Order/' ถ้าไม่ใช่ (Vercel หรือ Local) ให้ใช้ '/'
    base: isGitHubActions ? '/Pre-Order/' : '/',
  }
})