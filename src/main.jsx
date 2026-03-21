import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// Nhập khẩu thanh ray từ react-router-dom
import { BrowserRouter } from 'react-router-dom'
// Nhập khẩu nhà cung cấp dịch vụ Google
import { GoogleOAuthProvider } from '@react-oauth/google'


console.log("Mã Google hiện tại là:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Khoác áo choàng Google ra ngoài cùng để toàn bộ App dùng được */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* Đặt App lên trên thanh ray BrowserRouter */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)