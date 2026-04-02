import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatDate, generateId } from '../utils/helpers';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

/* ─── Order Create/Edit Modal ─── */
function OrderModal({ open, onClose, onSave, products, categories }) {
    const [customer, setCustomer] = useState('');
    const [items, setItems] = useState([{ id: generateId('ITEM'), productId: '', quantity: 1 }]);
    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState([]);

    React.useEffect(() => {
        if (open) { setCustomer(''); setItems([{ id: generateId('ITEM'), productId: '', quantity: 1 }]); setErrors({}); setWarnings([]); }
    }, [open]);

    const activeProducts = products.filter(p => p.status === 'Active');

    const addItem = () => setItems(prev => [...prev, { id: generateId('ITEM'), productId: '', quantity: 1 }]);
    const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
    const setItemField = (id, field, val) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
        setWarnings([]); setErrors({});
    };

    const totalPrice = items.reduce((sum, item) => {
        const p = products.find(p => p.id === item.productId);
        return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
    }, 0);

    const handleSave = () => {
        const errs = {}; const warns = [];
        if (!customer.trim()) errs.customer = 'Customer name is required.';

        const filledItems = items.filter(i => i.productId);
        if (filledItems.length === 0) errs.items = 'Add at least one product.';

        // Conflict: duplicates
        const pIds = filledItems.map(i => i.productId);
        if (new Set(pIds).size !== pIds.length) errs.items = 'This product is already added to the order.';

        filledItems.forEach(item => {
            const p = products.find(pr => pr.id === item.productId);
            if (!p) return;
            if (p.status !== 'Active') { warns.push(`"${p.name}" is currently unavailable.`); }
            if (parseInt(item.quantity) > p.stock) { warns.push(`Only ${p.stock} item(s) of "${p.name}" available in stock.`); }
        });

        setErrors(errs);
        setWarnings(warns);
        if (Object.keys(errs).length || warns.length) return;

        onSave({ customerName: customer, items: filledItems.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) })), totalPrice });
    };

    const getCatName = id => categories.find(c => c.id === id)?.name || '';

    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">🛒 Create New Order</span>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {/* Customer */}
                    <div className="form-group">
                        <label className="form-label">Customer Name *</label>
                        <input className="form-input" placeholder="e.g. John Smith" value={customer} onChange={e => setCustomer(e.target.value)} />
                        {errors.customer && <p className="form-error">{errors.customer}</p>}
                    </div>

                    {/* Products list */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Order Items *</label>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
                        </div>
                        <div className="order-items-list">
                            {items.map(item => {
                                const selectedProduct = products.find(p => p.id === item.productId);
                                return (
                                    <div className="order-item-row" key={item.id}>
                                        <select className="form-select" value={item.productId}
                                            onChange={e => setItemField(item.id, 'productId', e.target.value)}>
                                            <option value="">Select product…</option>
                                            {activeProducts.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} — {formatCurrency(p.price)} (Stock: {p.stock})
                                                </option>
                                            ))}
                                        </select>
                                        <input className="form-input order-item-qty" type="number" min="1"
                                            max={selectedProduct?.stock || 9999}
                                            value={item.quantity}
                                            onChange={e => setItemField(item.id, 'quantity', e.target.value)} />
                                        {items.length > 1 && (
                                            <button className="order-item-remove" type="button" onClick={() => removeItem(item.id)}>✕</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {errors.items && <p className="form-error" style={{ marginTop: 8 }}>{errors.items}</p>}
                    </div>

                    {/* Warnings */}
                    {warnings.map((w, i) => (
                        <div key={i} className="alert alert-warning">⚠️ {w}</div>
                    ))}

                    {/* Total */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Price:</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(totalPrice)}</span>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>✅ Confirm Order</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Status Update Modal ─── */
function StatusModal({ open, onClose, onSave, order }) {
    const [status, setStatus] = useState('');
    React.useEffect(() => { if (order) setStatus(order.status); }, [order]);
    if (!open || !order) return null;
    const nextStatuses = ORDER_STATUSES.filter(s => s !== 'Cancelled');
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">🔄 Update Order Status</span>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Order <strong>{order.id}</strong></p>
                    <div className="form-group">
                        <label className="form-label">New Status</label>
                        <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                            {nextStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => onSave(order.id, status)}>Save Status</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Order Detail Modal ─── */
function OrderDetailModal({ open, onClose, order, products, categories }) {
    if (!open || !order) return null;
    const getCatName = id => categories.find(c => c.id === id)?.name || '—';
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">📋 Order Details — {order.id}</span>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="form-row">
                        <div><div className="form-label">Customer</div><strong>{order.customerName}</strong></div>
                        <div><div className="form-label">Status</div><Badge status={order.status} /></div>
                        <div><div className="form-label">Date</div><span style={{ fontSize: 13 }}>{formatDate(order.createdAt)}</span></div>
                        <div><div className="form-label">Created By</div><span style={{ fontSize: 13 }}>{order.createdBy}</span></div>
                    </div>
                    <div className="divider" />
                    <div className="section-title">Items</div>
                    <table style={{ width: '100%' }}>
                        <thead><tr><th>Product</th><th>Category</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
                        <tbody>
                            {order.items.map((item, i) => {
                                const p = products.find(pr => pr.id === item.productId);
                                return (
                                    <tr key={i}>
                                        <td>{p?.name || item.productId}</td>
                                        <td><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getCatName(p?.categoryId)}</span></td>
                                        <td>{formatCurrency(p?.price)}</td>
                                        <td>{item.quantity}</td>
                                        <td><strong>{formatCurrency((p?.price || 0) * item.quantity)}</strong></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div style={{ textAlign: 'right', marginTop: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total: </span>
                        <strong style={{ fontSize: 18, color: 'var(--accent)' }}>{formatCurrency(order.totalPrice)}</strong>
                    </div>
                </div>
                <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Close</button></div>
            </div>
        </div>
    );
}

const PAGE_SIZE = 10;

export default function Orders() {
    const { orders, products, categories, createOrder, updateOrderStatus, cancelOrder } = useApp();
    const { user } = useAuth();
    const [createOpen, setCreateOpen] = useState(false);
    const [statusModal, setStatusModal] = useState({ open: false, order: null });
    const [detailModal, setDetailModal] = useState({ open: false, order: null });
    const [cancelTarget, setCancelTarget] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        return [...orders].reverse().filter(o => {
            const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
            const matchStatus = !filterStatus || o.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [orders, search, filterStatus]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleCreate = (data) => { createOrder(data, user); setCreateOpen(false); };
    const handleStatus = (id, status) => { updateOrderStatus(id, status, user); setStatusModal({ open: false, order: null }); };
    const handleCancel = () => { cancelOrder(cancelTarget, user); setCancelTarget(null); };

    const itemsStr = (order) => order.items.map(i => {
        const p = products.find(pr => pr.id === i.productId);
        return `${p?.name || '?'} ×${i.quantity}`;
    }).join(', ');

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Orders</div>
                    <div className="page-subtitle">{orders.length} total orders</div>
                </div>
                <button id="create-order-btn" className="btn btn-primary" onClick={() => setCreateOpen(true)}>➕ Create Order</button>
            </div>

            <div className="toolbar">
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input className="form-input" placeholder="Search by customer or order ID…" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="form-select" style={{ width: 150 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                    <option value="">All Statuses</option>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                    {paged.length === 0
                        ? <div className="empty-state"><div className="empty-state-icon">🛒</div><div className="empty-state-title">No orders yet</div><div className="empty-state-desc">Create your first order</div></div>
                        : <table>
                            <thead>
                                <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {paged.map(o => (
                                    <tr key={o.id}>
                                        <td><span style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 4 }}>{o.id}</span></td>
                                        <td><strong>{o.customerName}</strong></td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-secondary)' }}>{itemsStr(o)}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(o.totalPrice)}</td>
                                        <td><Badge status={o.status} /></td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(o.createdAt)}</td>
                                        <td>
                                            <div className="td-actions">
                                                <button className="btn btn-secondary btn-sm" title="View" onClick={() => setDetailModal({ open: true, order: o })}>👁️</button>
                                                {o.status !== 'Cancelled' && o.status !== 'Delivered' && (
                                                    <button className="btn btn-warning btn-sm" title="Update Status" onClick={() => setStatusModal({ open: true, order: o })}>🔄</button>
                                                )}
                                                {(o.status === 'Pending') && (
                                                    <button className="btn btn-danger btn-sm" title="Cancel" onClick={() => setCancelTarget(o.id)}>❌</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                </div>
                <div style={{ padding: '8px 16px' }}>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
                </div>
            </div>

            <OrderModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} products={products} categories={categories} />
            <StatusModal open={statusModal.open} onClose={() => setStatusModal({ open: false, order: null })} onSave={handleStatus} order={statusModal.order} />
            <OrderDetailModal open={detailModal.open} onClose={() => setDetailModal({ open: false, order: null })} order={detailModal.order} products={products} categories={categories} />
            <ConfirmDialog open={!!cancelTarget} onConfirm={handleCancel} onCancel={() => setCancelTarget(null)}
                title="Cancel Order" description="Cancel this order? Stock will be restored for Pending orders." confirmLabel="Cancel Order" danger />
        </div>
    );
}
