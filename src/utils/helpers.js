// ID generation
export const generateId = (prefix = 'ID') =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;

// Currency
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

// Date helpers
export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
export const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
};
export const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
export const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
};

// Restock priority
export const getRestockPriority = (stock, threshold) => {
  if (stock === 0) return 'High';
  if (stock <= Math.ceil(threshold / 2)) return 'High';
  if (stock <= threshold) return 'Medium';
  return 'Low';
};

export const getPriorityOrder = (p) => ({ High: 0, Medium: 1, Low: 2 }[p] ?? 3);

// LocalStorage
export const lsGet = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
export const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// Truncate
export const truncate = (str, n = 30) =>
  str && str.length > n ? str.slice(0, n) + '…' : str;

// Dashboard: today's stats
export const getTodayStats = (orders, products) => {
  const todayOrders = orders.filter(o => isToday(o.createdAt));
  const revenue = todayOrders
    .filter(o => !['Cancelled'].includes(o.status))
    .reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pending = orders.filter(o => o.status === 'Pending').length;
  const completed = orders.filter(o => o.status === 'Delivered').length;
  const lowStock = products.filter(p => p.stock < p.minThreshold && p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  return { todayOrders: todayOrders.length, revenue, pending, completed, lowStock, outOfStock };
};
