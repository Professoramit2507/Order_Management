// import React from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useApp } from '../context/AppContext';

// const NAV = [
//     {
//         section: 'Main', items: [
//             { to: '/dashboard', icon: '📊', label: 'Dashboard' },
//             { to: '/products', icon: '📦', label: 'Products' },
//             { to: '/categories', icon: '🏷️', label: 'Categories' },
//             { to: '/orders', icon: '🛒', label: 'Orders' },
//         ]
//     },
//     {
//         section: 'Operations', items: [
//             { to: '/restock', icon: '🔁', label: 'Restock Queue' },
//             { to: '/activity', icon: '📋', label: 'Activity Log' },
//         ]
//     },
// ];

// export default function Sidebar() {
//     const { user, logout } = useAuth();
//     const { restockQueue } = useApp();
//     const navigate = useNavigate();

//     const handleLogout = () => { logout(); navigate('/login'); };

//     return (
//         <aside className="sidebar">
//             <div className="sidebar-logo">
//                 <div className="logo-icon">📦</div>
//                 <div className="logo-text">
//                     InventoPro
//                     <span>Inventory System</span>
//                 </div>
//             </div>

//             <nav className="sidebar-nav">
//                 {NAV.map(section => (
//                     <div className="nav-section" key={section.section}>
//                         <div className="nav-section-label">{section.section}</div>
//                         {section.items.map(item => (
//                             <NavLink
//                                 key={item.to}
//                                 to={item.to}
//                                 className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
//                             >
//                                 <span className="nav-icon">{item.icon}</span>
//                                 {item.label}
//                                 {item.to === '/restock' && restockQueue.length > 0 && (
//                                     <span className="nav-badge">{restockQueue.length}</span>
//                                 )}
//                             </NavLink>
//                         ))}
//                     </div>
//                 ))}
//             </nav>

//             <div className="sidebar-footer">
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 8 }}>
//                     <div className="topbar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
//                         {user?.name?.[0]?.toUpperCase() || 'U'}
//                     </div>
//                     <div>
//                         <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.name}</div>
//                         <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.role}</div>
//                     </div>
//                 </div>
//                 <button className="btn btn-secondary w-full btn-sm" onClick={handleLogout}>
//                     🚪 Sign Out
//                 </button>
//             </div>
//         </aside>
//     );
// }





import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { restockQueue } = useApp();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => { 
        logout(); 
        navigate('/login'); 
    };

    const NAV = [
    {
        section: 'Main', items: [
            { to: '/dashboard', icon: '📊', label: 'Dashboard' },
            { to: '/products', icon: '📦', label: 'Products' },
            { to: '/categories', icon: '🏷️', label: 'Categories' },
            { to: '/orders', icon: '🛒', label: 'Orders' },
        ]
    },
    {
        section: 'Operations', items: [
            { to: '/restock', icon: '🔁', label: 'Restock Queue' },
            { to: '/activity', icon: '📋', label: 'Activity Log' },
        ]
    },
];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
                ☰
            </button>

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon">📦</div>
                    <div className="logo-text">
                        InventPro
                        <span>Inventory System</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NAV.map(section => (
                        <div className="nav-section" key={section.section}>
                            <div className="nav-section-label">{section.section}</div>
                            {section.items.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsOpen(false)} // auto close on mobile
                                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.label}
                                    {item.to === '/restock' && restockQueue.length > 0 && (
                                        <span className="nav-badge">{restockQueue.length}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="topbar-avatar">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div>{user?.name}</div>
                            <div className="text-muted">{user?.role}</div>
                        </div>
                    </div>
                    <button className="btn btn-secondary w-full btn-sm" onClick={handleLogout}>
                        🚪 Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}