import React from 'react';

export function StatusBadge({ status }) {
  const styles = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Chờ duyệt' },
    approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Đã duyệt' }
  };
  
  const current = styles[status] || styles.pending;

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${current.bg} ${current.text}`}>
      {current.label}
    </span>
  );
}