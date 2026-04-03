import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/Badge";
import { formatCurrency, getRestockPriority } from "../utils/helpers";

function RestockModal({ open, onClose, onSave, product }) {
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open) {
      setQty("");
      setError("");
    }
  }, [open]);

  const handleSave = () => {
    const n = parseInt(qty);
    if (!qty || isNaN(n) || n < 1) {
      setError("Enter a valid quantity (≥ 1)");
      return;
    }
    onSave(product.id, n);
    onClose();
  };

  if (!open || !product) return null;
  const newStock = product.stock + (parseInt(qty) || 0);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">🔁 Restock — {product.name}</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              padding: 12,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
              border: "1px solid var(--border)",
              marginBottom: 4,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 2,
                }}
              >
                CURRENT STOCK
              </div>
              <strong style={{ color: "var(--danger)" }}>
                {product.stock}
              </strong>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 2,
                }}
              >
                MIN THRESHOLD
              </div>
              <strong>{product.minThreshold}</strong>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 2,
                }}
              >
                NEEDED
              </div>
              <strong style={{ color: "var(--warning)" }}>
                {Math.max(0, product.minThreshold - product.stock)} units
              </strong>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 2,
                }}
              >
                AFTER RESTOCK
              </div>
              <strong
                style={{
                  color:
                    newStock >= product.minThreshold
                      ? "var(--success)"
                      : "var(--warning)",
                }}
              >
                {newStock}
              </strong>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Units to Add *</label>
            <input
              className="form-input"
              type="number"
              min="1"
              placeholder="e.g. 50"
              value={qty}
              onChange={(e) => {
                setQty(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleSave}>
            ✅ Restock
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RestockQueue() {
  const { restockQueue, products, categories, restockProduct } = useApp();
  const { user } = useAuth();
  const [restockModal, setRestockModal] = useState({
    open: false,
    product: null,
  });

  const getCatName = (id) => categories.find((c) => c.id === id)?.name || "—";

  const handleRestock = (id, qty) => {
    restockProduct(id, qty, user);
  };

  const priorityBar = (stock, threshold) => {
    const pct = threshold > 0 ? Math.min(100, (stock / threshold) * 100) : 0;
    const color =
      stock === 0
        ? "var(--danger)"
        : stock <= Math.ceil(threshold / 2)
          ? "var(--warning)"
          : "var(--info)";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="restock-priority-bar">
          <div
            className="restock-priority-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {Math.round(pct)}%
        </span>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Restock Queue</div>
          <div className="page-subtitle">
            {restockQueue.length} item(s) need restocking
          </div>
        </div>
      </div>

      {restockQueue.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">All stocked up!</div>
            <div className="empty-state-desc">
              No items currently in the restock queue.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary banner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {["High", "Medium", "Low"].map((p) => {
              const count = restockQueue.filter(
                (pr) => getRestockPriority(pr.stock, pr.minThreshold) === p,
              ).length;
              const colors = {
                High: "var(--danger)",
                Medium: "var(--warning)",
                Low: "var(--info)",
              };
              const bgs = {
                High: "var(--danger-light)",
                Medium: "var(--warning-light)",
                Low: "var(--info-light)",
              };
              return (
                <div
                  key={p}
                  style={{
                    background: bgs[p],
                    border: `1px solid ${colors[p]}33`,
                    borderRadius: 12,
                    padding: 16,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: 22, fontWeight: 800, color: colors[p] }}
                  >
                    {count}
                  </div>
                  <div
                    style={{ fontSize: 12, color: colors[p], fontWeight: 600 }}
                  >
                    {p} Priority
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Min Threshold</th>
                    <th>Stock Level</th>
                    <th>Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {restockQueue.map((p) => {
                    const priority = getRestockPriority(
                      p.stock,
                      p.minThreshold,
                    );
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 12,
                              background: "var(--accent-light)",
                              color: "var(--accent)",
                              padding: "2px 8px",
                              borderRadius: 99,
                            }}
                          >
                            {getCatName(p.categoryId)}
                          </span>
                        </td>
                        <td>{formatCurrency(p.price)}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                p.stock === 0
                                  ? "var(--danger)"
                                  : "var(--warning)",
                            }}
                          >
                            {p.stock}
                          </span>
                          {p.stock === 0 && (
                            <span
                              style={{
                                fontSize: 10,
                                marginLeft: 4,
                                color: "var(--danger)",
                              }}
                            >
                              OUT
                            </span>
                          )}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {p.minThreshold}
                        </td>
                        <td>{priorityBar(p.stock, p.minThreshold)}</td>
                        <td>
                          <Badge status={priority} />
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              setRestockModal({ open: true, product: p })
                            }
                          >
                            🔁 Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <RestockModal
        open={restockModal.open}
        onClose={() => setRestockModal({ open: false, product: null })}
        onSave={handleRestock}
        product={restockModal.product}
      />
    </div>
  );
}
