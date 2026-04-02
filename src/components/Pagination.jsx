import React from 'react';

export default function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
    if (totalPages <= 1) return null;
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <div className="pagination">
            <span className="pagination-info">{start}–{end} of {totalItems}</span>
            <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>‹</button>
            {pages.map((p, i) =>
                p === '...'
                    ? <span key={`e${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
                    : <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
            )}
            <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>›</button>
        </div>
    );
}
