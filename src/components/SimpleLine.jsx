import React from 'react';

export function SimpleLine({ data = [], height = 180, className, formatValue }) {
  const width = 600;

  // Nếu không có dữ liệu, hiển thị khung trống chuẩn chỉnh
  if (!data || data.length === 0) {
    return (
      <div className={className} style={{ height }}>
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          border: '1px dashed #334155',
          backgroundColor: '#0f172a',
          color: '#64748b',
          fontSize: '14px'
        }}>
          📈 Chưa có dữ liệu đường xu hướng
        </div>
      </div>
    );
  }

  // Tính toán các mốc tọa độ dựa trên giá trị lớn nhất / nhỏ nhất
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const padX = 36; // Đệm rộng ra chút để chữ không bị lút ra mép
  const padY = 28;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  // Map dữ liệu thô sang tọa độ Oxy trên màn hình
  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(1, data.length - 1)) * innerW;
    const y = padY + innerH - ((d.value - min) / range) * innerH;
    return { x, y, label: d.label, value: d.value };
  });

  // Tạo chuỗi Path nối các điểm lại với nhau
  const pathData = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  // Tạo chuỗi Path bao bọc vùng diện tích dưới đường vẽ để đổ màu Gradient
  const areaData = `${pathData} L ${points[points.length - 1].x} ${padY + innerH} L ${padX} ${padY + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width: '100%', height, display: 'block' }}
      aria-hidden
    >
      <defs>
        {/* Đổ màu mờ dần phía dưới đường kẻ (Xanh Neon dịu mắt) */}
        <linearGradient id="tutorlink-line-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Phần diện tích đổ bóng phía dưới */}
      <path d={areaData} fill="url(#tutorlink-line-gradient)" />

      {/* 2. Đường line chính (Màu Xanh Sky rực rỡ nét căng) */}
      <path
        d={pathData}
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. Vẽ các điểm nút (Dots) và hiển thị chữ */}
      {points.map((p) => (
        <g key={p.label}>
          {/* Chấm tròn lõi */}
          <circle cx={p.x} cy={p.y} r="4" fill="#38bdf8" />
          {/* Vòng tròn hiệu ứng radar bao ngoài */}
          <circle cx={p.x} cy={p.y} r="9" fill="#38bdf8" opacity="0.2" />

          {/* Nhãn mốc thời gian / danh mục (Ví dụ: Tuần 1, Tuần 2,...) */}
          <text
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            fontSize="12"
            fill="#94a3b8"
            fontWeight="500"
          >
            {p.label}
          </text>

          {/* Chỉ số giá trị trên đầu mỗi nút */}
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#f8fafc"
          >
            {formatValue ? formatValue(p.value) : p.value.toLocaleString('vi-VN')}
          </text>
        </g>
      ))}
    </svg>
  );
}