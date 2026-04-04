import React from 'react';
import { Link } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import { formatCurrency, formatTime,  getTodayStats } from '../utils/helpers';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

function buildOrderTrend(orders) {
    const days = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        days[key] = { date: key, orders: 0, revenue: 0 };
    }
    orders.forEach(o => {
        const key = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[key] && o.status !== 'Cancelled') {
            days[key].orders++;
            days[key].revenue += o.totalPrice || 0;
        }
    });
    return Object.values(days);
}

function buildStatusPie(orders) {
    const counts = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function Dashboard() {
    const { products, orders, activityLog, restockQueue } = useApp();
    const { user } = useAuth();
    const stats = getTodayStats(orders, products);
    const trend = buildOrderTrend(orders);
    const pie = buildStatusPie(orders);

    const stockItems = [...products]
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 8);

    const recentLog = activityLog.slice(0, 6);

    return (
        <div>
            {/* Welcome */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 , }}>Good {getGreeting()}, {user?.name?.split(' ')[0]}!</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Here's what's happening with your inventory today.</p>
            </div>

            {/* Stat cards */}
            <div className="stat-grid">
                <div className="stat-card" style={{ '--card-color': 'var(--accent)' }}>
                    <div className="stat-card-top">
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Orders Today</div>
                        <div className="stat-card-icon" style={{ background: 'var(--accent-light)' }}>🛒</div>
                    </div>
                    <div className="stat-card-value">{stats.todayOrders}</div>
                    <div className="stat-card-change">Total orders placed today</div>
                </div>
                <div className="stat-card" style={{ '--card-color': 'var(--warning)' }}>
                    <div className="stat-card-top">
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Pending</div>
                        <div className="stat-card-icon" style={{ background: 'var(--warning-light)' }}>⏳</div>
                    </div>
                    <div className="stat-card-value">{stats.pending}</div>
                    <div className="stat-card-change">{stats.completed} delivered</div>
                </div>
                <div className="stat-card" style={{ '--card-color': 'var(--danger)' }}>
                    <div className="stat-card-top">
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Low Stock</div>
                        <div className="stat-card-icon" style={{ background: 'var(--danger-light)' }}>⚠️</div>
                    </div>
                    <div className="stat-card-value">{restockQueue.length}</div>
                    <div className="stat-card-change">{stats.outOfStock} out of stock</div>
                </div>
                <div className="stat-card" style={{ '--card-color': 'var(--success)' }}>
                    <div className="stat-card-top">
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Revenue Today</div>
                        <div className="stat-card-icon" style={{ background: 'var(--success-light)' }}>💰</div>
                    </div>
                    <div className="stat-card-value" style={{ fontSize: 20 }}>{formatCurrency(stats.revenue)}</div>
                    <div className="stat-card-change">from {stats.todayOrders} order(s)</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-title">7-Day Order & Revenue Trend</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={trend} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#151e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} name="Orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <div className="chart-title">Orders by Status</div>
                    {pie.length === 0
                        ? <div className="empty-state"><div className="empty-state-icon">📊</div><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No orders yet</p></div>
                        : <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                    dataKey="value" nameKey="name" paddingAngle={3}>
                                    {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#151e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>
            </div>

            {/* Bottom 2-col */}
            <div className="dashboard-bottom">
                {/* Product summary */}
                <div className="card">
                    <div className="section-title">📦 Product Stock Summary</div>
                    {stockItems.length === 0
                        ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No products yet.</p>
                        : <div className="product-summary-list">
                            {stockItems.map(p => {
                                // const priority = getRestockPriority(p.stock, p.minThreshold);
                                const isLow = p.stock < p.minThreshold;
                                return (
                                    <div className="product-summary-item" key={p.id}>
                                        <div>
                                            <div className="product-summary-name">{p.name}</div>
                                            <div className="product-summary-cat">{p.categoryId}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className="product-summary-stock">
                                                {p.stock === 0 ? '0 left' : `${p.stock} left`}
                                            </span>
                                            <Badge status={isLow ? (p.stock === 0 ? 'Out of Stock' : 'Low') : 'Active'} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    }
                    <div style={{ marginTop: 12 }}>
                        <Link to="/products" className="btn btn-secondary btn-sm">View All Products →</Link>
                    </div>
                </div>

                {/* Activity log */}
                <div className="card">
                    <div className="section-title">📋 Recent Activity</div>
                    {recentLog.length === 0
                        ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No activity yet.</p>
                        : <div className="activity-list">
                            {recentLog.map(entry => (
                                <div className="activity-item" key={entry.id}>
                                    <div className="activity-dot" />
                                    <div>
                                        <div className="activity-msg">{entry.message}</div>
                                        <div className="activity-time">{formatTime(entry.timestamp)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    <div style={{ marginTop: 12 }}>
                        <Link to="/activity" className="btn btn-secondary btn-sm">View All Logs →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}
