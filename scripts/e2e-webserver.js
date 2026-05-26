const { spawn } = require('child_process');

const url = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

async function isReachable() {
  try {
    // Kiểm tra xem server frontend của TutorLink đã chạy chưa
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function run() {
  if (await isReachable()) {
    console.log(`✅ [TutorLink Test] Server đã hoạt động sẵn tại ${url}`);
    setInterval(() => {}, 1000);
  } else {
    console.log(`🚀 [TutorLink Test] Server chưa bật. Đang tự động kích hoạt Vite trên cổng 5173...`);
    
    // Tự động gõ lệnh chạy dự án frontend bằng lệnh npm run dev -- --port 5173
    const child = spawn('npm', ['run', 'dev', '--', '--port', '5173'], {
      stdio: 'inherit',
      shell: process.platform === 'win32', // Tương thích mượt mà nếu dùng Windows
    });

    const stop = () => child.kill('SIGTERM');
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
    child.on('exit', (code) => process.exit(code ?? 0));
  }
}

run();