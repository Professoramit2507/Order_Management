import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { lsGet, lsSet, generateId, formatDateTime } from '../utils/helpers';

const AppContext = createContext(null);

/* ── Seed data ── */
const SEED_CATEGORIES = [
    { id: 'cat-1', name: 'Electronics' },
    { id: 'cat-2', name: 'Clothing' },
    { id: 'cat-3', name: 'Grocery' },
    { id: 'cat-4', name: 'Accessories' },
];
const SEED_PRODUCTS = [
    { id: 'p-1', name: 'iPhone 13', categoryId: 'cat-1', price: 799, stock: 3, minThreshold: 5, status: 'Active', createdAt: new Date().toISOString() },
    { id: 'p-2', name: 'Samsung Galaxy S22', categoryId: 'cat-1', price: 699, stock: 12, minThreshold: 5, status: 'Active', createdAt: new Date().toISOString() },
    { id: 'p-3', name: 'T-Shirt (Large)', categoryId: 'cat-2', price: 25, stock: 50, minThreshold: 10, status: 'Active', createdAt: new Date().toISOString() },
    { id: 'p-4', name: 'Wireless Headphones', categoryId: 'cat-4', price: 149, stock: 2, minThreshold: 5, status: 'Active', createdAt: new Date().toISOString() },
    { id: 'p-5', name: 'Laptop Stand', categoryId: 'cat-4', price: 45, stock: 0, minThreshold: 3, status: 'Out of Stock', createdAt: new Date().toISOString() },
    { id: 'p-6', name: 'Organic Coffee Beans', categoryId: 'cat-3', price: 18, stock: 30, minThreshold: 10, status: 'Active', createdAt: new Date().toISOString() },
];

export function AppProvider({ children }) {
    const [categories, setCategories] = useState(() => lsGet('inv_categories', SEED_CATEGORIES));
    const [products, setProducts] = useState(() => lsGet('inv_products', SEED_PRODUCTS));
    const [orders, setOrders] = useState(() => lsGet('inv_orders', []));
    const [activityLog, setActivityLog] = useState(() => lsGet('inv_log', []));

    useEffect(() => { lsSet('inv_categories', categories); }, [categories]);
    useEffect(() => { lsSet('inv_products', products); }, [products]);
    useEffect(() => { lsSet('inv_orders', orders); }, [orders]);
    useEffect(() => { lsSet('inv_log', activityLog); }, [activityLog]);

    /* ── Log ── */
    const addLog = useCallback((message, type = 'info') => {
        const entry = { id: generateId('LOG'), message, type, timestamp: new Date().toISOString() };
        setActivityLog(prev => [entry, ...prev].slice(0, 100));
        return entry;
    }, []);

    /* ── Categories ── */
    const addCategory = useCallback((name) => {
        const cat = { id: generateId('CAT'), name: name.trim() };
        setCategories(prev => [...prev, cat]);
        addLog(`Category "${name}" created`);
        return cat;
    }, [addLog]);

    const deleteCategory = useCallback((id) => {
        setCategories(prev => prev.filter(c => c.id !== id));
        addLog(`Category deleted`);
    }, [addLog]);

    /* ── Products ── */
    const addProduct = useCallback((data) => {
        const stock = parseInt(data.stock) || 0;
        const product = {
            id: generateId('PRD'),
            ...data,
            stock,
            minThreshold: parseInt(data.minThreshold) || 5,
            price: parseFloat(data.price) || 0,
            status: stock === 0 ? 'Out of Stock' : (data.status || 'Active'),
            createdAt: new Date().toISOString(),
        };
        setProducts(prev => [...prev, product]);
        addLog(`Product "${product.name}" added (Stock: ${stock})`);
        return product;
    }, [addLog]);

    const updateProduct = useCallback((id, data) => {
        setProducts(prev => prev.map(p => {
            if (p.id !== id) return p;
            const stock = parseInt(data.stock) ?? p.stock;
            const status = stock === 0 ? 'Out of Stock' : (data.status || 'Active');
            return { ...p, ...data, stock, status };
        }));
        addLog(`Product "${data.name || id}" updated`);
    }, [addLog]);

    const deleteProduct = useCallback((id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        addLog(`Product deleted`);
    }, [addLog]);

    /* ── Stock deduction (internal) ── */
    const deductStock = useCallback((items) => {
        setProducts(prev => prev.map(p => {
            const item = items.find(i => i.productId === p.id);
            if (!item) return p;
            const newStock = Math.max(0, p.stock - item.quantity);
            const status = newStock === 0 ? 'Out of Stock' : p.status;
            if (newStock < p.minThreshold) {
                // Side effect: log restock queue addition happens separately in createOrder
            }
            return { ...p, stock: newStock, status };
        }));
    }, []);

    /* ── Orders ── */
    const createOrder = useCallback((data, currentUser) => {
        const order = {
            id: generateId('ORD'),
            customerName: data.customerName,
            items: data.items,
            totalPrice: data.totalPrice,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            createdBy: currentUser?.name || 'User',
        };
        setOrders(prev => [...prev, order]);
        // Deduct stock
        setProducts(prev => prev.map(p => {
            const item = order.items.find(i => i.productId === p.id);
            if (!item) return p;
            const newStock = Math.max(0, p.stock - item.quantity);
            const status = newStock === 0 ? 'Out of Stock' : p.status;
            return { ...p, stock: newStock, status };
        }));
        addLog(`Order ${order.id} created by ${order.createdBy} for "${data.customerName}"`);
        // Check low-stock after deduction
        data.items.forEach(item => {
            // log is handled generically; queue is derived from products state
        });
        return order;
    }, [addLog]);

    const updateOrderStatus = useCallback((id, status, user) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o));
        addLog(`Order ${id} marked as ${status} by ${user?.name || 'User'}`);
    }, [addLog]);

    const cancelOrder = useCallback((id, user) => {
        let cancelledOrder;
        setOrders(prev => prev.map(o => {
            if (o.id !== id) return o;
            cancelledOrder = o;
            return { ...o, status: 'Cancelled', updatedAt: new Date().toISOString() };
        }));
        // Restore stock
        if (cancelledOrder && cancelledOrder.status === 'Pending') {
            setProducts(prev => prev.map(p => {
                const item = cancelledOrder.items.find(i => i.productId === p.id);
                if (!item) return p;
                const newStock = p.stock + item.quantity;
                return { ...p, stock: newStock, status: newStock > 0 ? 'Active' : 'Out of Stock' };
            }));
        }
        addLog(`Order ${id} cancelled by ${user?.name || 'User'}`);
    }, [addLog]);

    /* ── Restock ── */
    const restockProduct = useCallback((id, addQty, user) => {
        let pName = '';
        setProducts(prev => prev.map(p => {
            if (p.id !== id) return p;
            pName = p.name;
            const newStock = p.stock + parseInt(addQty);
            const status = newStock > 0 ? 'Active' : 'Out of Stock';
            return { ...p, stock: newStock, status };
        }));
        addLog(`Stock updated for "${pName}" (+${addQty} units) by ${user?.name || 'User'}`);
    }, [addLog]);

    /* ── Derived: restock queue ── */
    const restockQueue = products
        .filter(p => p.stock < p.minThreshold)
        .sort((a, b) => a.stock - b.stock);

    return (
        <AppContext.Provider value={{
            categories, addCategory, deleteCategory,
            products, addProduct, updateProduct, deleteProduct, restockProduct,
            orders, createOrder, updateOrderStatus, cancelOrder,
            activityLog, addLog,
            restockQueue,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
