import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/helpers';

const TYPE_ICONS = { info: '📋', success: '✅', warning: '⚠️', error: '❌' };
const PAGE_SIZE = 20;

export default function ActivityLog() {
    const { activityLog } = useApp();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filtered = activityLog.filter(e =>
        e.message.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Activity Log</div>
                    <div className="page-subtitle">{activityLog.length} total entries</div>
                </div>
            </div>

            <div className="toolbar">
                <div className="search-input-wrap" style={{ maxWidth: 350 }}>
                    <span className="search-icon">🔍</span>
                    <input className="form-input" placeholder="Search activity…" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>Showing latest {Math.min(paged.length, PAGE_SIZE)} entries</span>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {paged.length === 0
                    ? <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No activity yet</div><div className="empty-state-desc">System actions will appear here</div></div>
                    : <div style={{ padding: '8px 0' }}>
                        {paged.map((entry, i) => (
                            <div key={entry.id} className="activity-item" style={{ padding: '12px 20px', borderBottom: i < paged.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{TYPE_ICONS[entry.type] || '📋'}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="activity-msg" style={{ marginBottom: 2 }}>{entry.message}</div>
                                    <div className="activity-time">{formatDateTime(entry.timestamp)}</div>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>{entry.id}</div>
                            </div>
                        ))}
                    </div>
                }
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 6 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}
                            style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: p === page ? 'var(--accent)' : 'transparent', color: p === page ? '#fff' : 'var(--text-secondary)' }}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
