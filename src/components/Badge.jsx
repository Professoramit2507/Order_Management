import React from 'react';

export default function Badge({ status }) {
    const map = {
        // order statuses
        'Pending': 'badge badge-pending',
        'Confirmed': 'badge badge-confirmed',
        'Shipped': 'badge badge-shipped',
        'Delivered': 'badge badge-delivered',
        'Cancelled': 'badge badge-cancelled',
        // product statuses
        'Active': 'badge badge-active',
        'Out of Stock': 'badge badge-out-of-stock',
        // priority
        'High': 'badge badge-high',
        'Medium': 'badge badge-medium',
        'Low': 'badge badge-low',
    };
    const icons = {
        'Pending': '⏳', 'Confirmed': '✅', 'Shipped': '🚚',
        'Delivered': '📬', 'Cancelled': '❌',
        'Active': '🟢', 'Out of Stock': '🔴',
        'High': '🔴', 'Medium': '🟡', 'Low': '🔵',
    };
    return (
        <span className={map[status] || 'badge'}>
            {icons[status] || ''} {status}
        </span>
    );
}
