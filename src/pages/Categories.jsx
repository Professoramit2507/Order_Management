import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Categories() {
    const { categories, addCategory, deleteCategory, products } = useApp();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [search, setSearch] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) { setError('Category name is required.'); return; }
        if (categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
            setError('A category with this name already exists.'); return;
        }
        addCategory(trimmed);
        setName(''); setError('');
    };

    const handleDelete = () => {
        deleteCategory(deleteTarget);
        setDeleteTarget(null);
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const getProductCount = (catId) => products.filter(p => p.categoryId === catId).length;

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Categories</div>
                    <div className="page-subtitle">Organize your products into categories</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, alignItems: 'start' }}>
                {/* Add form */}
                <div className="card">
                    <div className="section-title">➕ Add Category</div>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Category Name</label>
                            <input id="cat-name" className="form-input" placeholder="e.g. Electronics"
                                value={name} onChange={e => { setName(e.target.value); setError(''); }} />
                            {error && <p className="form-error">{error}</p>}
                        </div>
                        <button id="cat-add-btn" type="submit" className="btn btn-primary">Add Category</button>
                    </form>
                </div>

                {/* List */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div className="section-title" style={{ marginBottom: 0 }}>All Categories ({categories.length})</div>
                        <input className="form-input" style={{ width: 180 }} placeholder="🔍 Search..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {filtered.length === 0
                        ? <div className="empty-state"><div className="empty-state-icon">🏷️</div><div className="empty-state-title">No categories found</div></div>
                        : <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>#</th><th>Category Name</th><th>Products</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map((cat, i) => (
                                        <tr key={cat.id}>
                                            <td><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{i + 1}</span></td>
                                            <td><strong>{cat.name}</strong></td>
                                            <td><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{getProductCount(cat.id)} product(s)</span></td>
                                            <td>
                                                <button className="btn btn-danger btn-sm"
                                                    onClick={() => setDeleteTarget(cat.id)}
                                                    disabled={getProductCount(cat.id) > 0}
                                                    title={getProductCount(cat.id) > 0 ? 'Remove all products first' : 'Delete'}>
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                title="Delete Category"
                description="Are you sure you want to delete this category? This action cannot be undone."
                confirmLabel="Delete"
                danger
            />
        </div>
    );
}
