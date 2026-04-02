import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/helpers';

const STATUSES = ['Active', 'Out of Stock'];
const DEFAULT_FORM = { name: '', categoryId: '', price: '', stock: '', minThreshold: '5', status: 'Active' };

function ProductModal({ open, onClose, onSave, categories, initial }) {
    const [form, setForm] = useState(initial || DEFAULT_FORM);
    const [errors, setErrors] = useState({});

    React.useEffect(() => { setForm(initial || DEFAULT_FORM); setErrors({}); }, [open, initial]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Product name is required';
        if (!form.categoryId) e.categoryId = 'Category is required';
        if (!form.price || isNaN(+form.price) || +form.price < 0) e.price = 'Valid price required';
        if (form.stock === '' || isNaN(+form.stock) || +form.stock < 0) e.stock = 'Valid stock quantity required';
        if (!form.minThreshold || isNaN(+form.minThreshold) || +form.minThreshold < 1) e.minThreshold = 'Min threshold ≥ 1';
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        onSave(form);
    };

    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={ev => ev.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{initial ? '✏️ Edit Product' : '➕ Add Product'}</span>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Product Name *</label>
                                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. iPhone 13" />
                                {errors.name && <p className="form-error">{errors.name}</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select className="form-select" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                                    <option value="">Select category…</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.categoryId && <p className="form-error">{errors.categoryId}</p>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Price ($) *</label>
                                <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
                                {errors.price && <p className="form-error">{errors.price}</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock Quantity *</label>
                                <input className="form-input" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
                                {errors.stock && <p className="form-error">{errors.stock}</p>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Min Stock Threshold *</label>
                                <input className="form-input" type="number" min="1" value={form.minThreshold} onChange={e => set('minThreshold', e.target.value)} placeholder="5" />
                                {errors.minThreshold && <p className="form-error">{errors.minThreshold}</p>}
                                <p className="form-hint">Alert when stock goes below this</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">💾 {initial ? 'Update' : 'Add'} Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const PAGE_SIZE = 10;

export default function Products() {
    const { products, categories, addProduct, updateProduct, deleteProduct } = useApp();
    const [modal, setModal] = useState({ open: false, initial: null, editId: null });
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const getCatName = id => categories.find(c => c.id === id)?.name || id;

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchCat = !filterCat || p.categoryId === filterCat;
            const matchStatus = !filterStatus || p.status === filterStatus;
            return matchSearch && matchCat && matchStatus;
        });
    }, [products, search, filterCat, filterStatus]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openAdd = () => setModal({ open: true, initial: null, editId: null });
    const openEdit = (p) => setModal({ open: true, initial: { ...p, price: String(p.price), stock: String(p.stock), minThreshold: String(p.minThreshold) }, editId: p.id });
    const closeModal = () => setModal({ open: false, initial: null, editId: null });

    const handleSave = (form) => {
        if (modal.editId) updateProduct(modal.editId, form);
        else addProduct(form);
        closeModal();
    };

    const handleDelete = () => { deleteProduct(deleteTarget); setDeleteTarget(null); };

    const stockColor = (p) => {
        if (p.stock === 0) return 'var(--danger)';
        if (p.stock < p.minThreshold) return 'var(--warning)';
        return 'var(--success)';
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Products</div>
                    <div className="page-subtitle">{products.length} total products</div>
                </div>
                <button id="add-product-btn" className="btn btn-primary" onClick={openAdd}>➕ Add Product</button>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input className="form-input" placeholder="Search products…" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="form-select" style={{ width: 160 }} value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                    <option value="">All Status</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                    {paged.length === 0
                        ? <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">No products found</div><div className="empty-state-desc">Add your first product or adjust filters</div></div>
                        : <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Min Threshold</th>
                                    <th>Status</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.name}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.id}</span></td>
                                        <td><span style={{ fontSize: 12, background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 99 }}>{getCatName(p.categoryId)}</span></td>
                                        <td style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: stockColor(p) }}>{p.stock}</span>
                                            {p.stock < p.minThreshold && p.stock > 0 && <span style={{ fontSize: 10, color: 'var(--warning)', marginLeft: 4 }}>LOW</span>}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{p.minThreshold}</td>
                                        <td><Badge status={p.status} /></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(p.createdAt)}</td>
                                        <td>
                                            <div className="td-actions">
                                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>✏️</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(p.id)}>🗑️</button>
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

            <ProductModal open={modal.open} onClose={closeModal} onSave={handleSave} categories={categories} initial={modal.initial} />
            <ConfirmDialog open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
                title="Delete Product" description="This will permanently delete the product. This cannot be undone." confirmLabel="Delete" danger />
        </div>
    );
}
