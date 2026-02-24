import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // เมื่อคุณสั่ง npm run build (เพื่อจะเอาไป deploy ขึ้น gh-pages) 
  // ตัวแปร command จะมีค่าเป็น 'build'
  
  // แต่ Vercel ก็ใช้คำสั่ง 'build' เหมือนกัน! 
  // ดังน้ันเราต้องเช็คตัวแปร VERCEL เพื่อแยกว่า Vercel กำลังทำงานอยู่หรือเปล่า
  const isVercel = process.env.VERCEL === '1';

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    // ถ้าเป็นการ build และ ไม่ได้อยู่บน Vercel (หมายความว่าคุณสั่ง npm run build ในเครื่องตัวเองเพื่อจะทำ npm run deploy)
    // ให้ใช้ '/Pre-Order/'
    // นอกนั้น (รันบนเครื่อง npm run dev หรือ รันบน Vercel) ให้ใช้ '/'
    base: (command === 'build' && !isVercel) ? '/Pre-Order/' : '/',
  }
})