/**
 * Định dạng số thành đơn vị tiền tệ VNĐ (Ví dụ: 200000 -> 200.000 ₫)
 */
export function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

/**
 * Đảm bảo dữ liệu trả về luôn là một mảng an toàn.
 * Tự động bóc vỏ các cấu trúc bọc mảng phổ biến của API Backend (data, items, results).
 */
export function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.results)) return payload.results;
  }
  
  return [];
}

/**
 * Định dạng chuỗi ngày tháng sang chuẩn Việt Nam (Ví dụ: 2026-05-21... -> 21/5/2026)
 */
export function shortDate(value) {
  if (!value) return '';
  
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  
  return date.toLocaleDateString('vi-VN');
}