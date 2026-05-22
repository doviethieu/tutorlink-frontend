import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // 🛠️ ĐÃ SỬA: Đổi từ @vitejs/react-plugin sang đúng chuẩn hệ thống
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Định nghĩa ký tự @ đại diện chính xác cho thư mục src, sửa xong lỗi import trước đó
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    cors: true
  }
});