import React from 'react';

export function SimpleBars({ data = [], height = 180, className }) {
  const width = 600;

  // Trường hợp không có dữ liệu, trả về giao diện trống chuẩn Dark Mode
  if (!data || data.length === 0) {
    return (
      <div className={className} style={{ height }}>
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          border: '1px dashed #E7DED2',
          backgroundColor: '#FAF7F0',
          color: '#8A7D72',
          fontSize: '14px'
        }}>
          📊 Chưa có dữ liệu thống kê
        </div>
      </div>
    );
  }

  // Tìm giá trị lớn nhất để tính toán tỷ lệ chiều cao cột
  const max = Math.max(...data.map((d) => d.value), 1);
  const padX = 30; // Khoảng cách đệm hai bên trái phải
  const padY = 24; // Khoảng cách đệm trên dưới
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const gap = 16;  // Khoảng cách giữa các cột
  const barW = (innerW - gap * (data.length - 1)) / data.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width: '100%', height, display: 'block' }}
      aria-hidden
    >
      <defs>
        {/* Tạo màu Gradient mượt mà từ Xanh Dương sang Xanh Tím Neon phù hợp Cyberpunk Dark Mode */}
        <linearGradient id="tutorlink-bar-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C05A3E" />   {/* Sky 400 */}
          <stop offset="100%" stopColor="#6366f1" /> {/* Indigo 500 */}
        </linearGradient>
      </defs>

      {data.map((d, i) => {
        // Tính toán tọa độ và chiều cao chuẩn chỉnh cho từng cột SVG
        const h = (d.value / max) * innerH;
        const x = padX + i * (barW + gap);
        const y = padY + innerH - h;

        return (
          <g key={d.label} style={{ transition: 'all 0.3s' }}>
            {/* Cột biểu đồ */}
            <rect 
              x={x} 
              y={y} 
              width={barW} 
              height={h} 
              rx="6" 
              fill="url(#tutorlink-bar-fill)"
              style={{ cursor: 'pointer', opacity: 0.9 }}
            />
            
            {/* Nhãn chữ hiển thị bên dưới cột (Ví dụ: Tháng 1, Tháng 2 hoặc Thứ 2, Thứ 3) */}
            <text 
              x={x + barW / 2} 
              y={height - 4} 
              textAnchor="middle" 
              fontSize="12" 
              fill="#5F6B7A" 
              fontWeight="500"
            >
              {d.label}
            </text>
            
            {/* Con số hiển thị giá trị ngay trên đầu cột */}
            <text 
              x={x + barW / 2} 
              y={y - 8} 
              textAnchor="middle" 
              fontSize="12" 
              fontWeight="600" 
              fill="#1E293B"
            >
              {d.value.toLocaleString('vi-VN')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}