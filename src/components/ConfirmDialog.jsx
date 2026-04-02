import React from 'react';

export default function ConfirmDialog({ open, onConfirm, onCancel, title, description, confirmLabel = 'Confirm', danger = false }) {
    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-body">
                    <div className="confirm-icon">{danger ? '⚠️' : '❓'}</div>
                    <div className="confirm-title">{title}</div>
                    <p className="confirm-desc">{description}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
