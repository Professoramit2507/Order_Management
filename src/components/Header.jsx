import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TITLES = {
    '/dashboard': { title: 'Dashboard', sub: 'Overview' },
    '/products': { title: 'Products', sub: 'Manage inventory items' },
    '/categories': { title: 'Categories', sub: 'Organize product categories' },
    '/orders': { title: 'Orders', sub: 'Manage customer orders' },
    '/restock': { title: 'Restock Queue', sub: 'Low stock items requiring attention' },
    '/activity': { title: 'Activity Log', sub: 'Recent system events' },
};

export default function Header() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const info = TITLES[pathname] || { title: 'InventoPro', sub: '' };
    const now = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="topbar-title">{info.title}</div>
                <div className="topbar-breadcrumb">{info.sub} · {now}</div>
            </div>
            <div className="topbar-right">
                <div className="topbar-user">
                    <div className="name">{user?.name}</div>
                    <div className="role">{user?.role || 'User'}</div>
                </div>
                <div className="topbar-avatar">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
}
