import React from "react";
import ItemCard from "./ItemCard";
import { DEFAULT_ITEM, formatCurrency, numberToWords } from "../utils/helpers";

export default function ItemsForm({ items, onChange, totals, onTotalsChange }) {
  const addItem = () => onChange([...items, DEFAULT_ITEM()]);
  const updateItem = (index, updated) =>
    onChange(items.map((it, i) => (i === index ? updated : it)));
  const deleteItem = (index) => {
    if (items.length > 1) onChange(items.filter((_, i) => i !== index));
  };

  const {
    totalAmount,
    cgstPercent,
    sgstPercent,
    cgstAmount,
    sgstAmount,
    roundOff,
    grandTotal,
  } = totals;

  return (
    <div className="tab-section">
      <div className="tab-section-header">
        <span className="tab-section-icon">📦</span>
        <div>
          <h2 className="tab-section-title">Items / Products</h2>
          <p className="tab-section-sub">
            QTY = Size A × Size B &nbsp;|&nbsp; Amount = NOS × QTY × Rate (auto)
          </p>
        </div>
      </div>

      {/* Item Cards */}
      <div className="items-list">
        {items.map((item, idx) => (
          <ItemCard
            key={item.id || idx}
            item={item}
            index={idx}
            onChange={(updated) => updateItem(idx, updated)}
            onDelete={() => deleteItem(idx)}
            canDelete={items.length > 1}
          />
        ))}
      </div>

      {/* Add Item */}
      <button className="add-item-btn" onClick={addItem}>
        <span className="add-item-icon">+</span>
        Add Another Item
      </button>

      {/* Totals */}
      <div className="totals-card">
        <div className="totals-card-title">🧮 Totals Summary</div>
        <div className="totals-rows">
          <div className="totals-line">
            <span className="tl-label">Total Amount</span>
            <span className="tl-value">₹ {formatCurrency(totalAmount)}</span>
          </div>
          <div className="totals-line">
            <span className="tl-label">
              CGST
              <input
                type="number"
                className="gst-pct-input"
                value={cgstPercent}
                onChange={(e) =>
                  onTotalsChange("cgstPercent", parseFloat(e.target.value) || 0)
                }
                min="0"
                max="28"
              />
              %
            </span>
            <span className="tl-value">₹ {formatCurrency(cgstAmount)}</span>
          </div>
          <div className="totals-line">
            <span className="tl-label">
              SGST
              <input
                type="number"
                className="gst-pct-input"
                value={sgstPercent}
                onChange={(e) =>
                  onTotalsChange("sgstPercent", parseFloat(e.target.value) || 0)
                }
                min="0"
                max="28"
              />
              %
            </span>
            <span className="tl-value">₹ {formatCurrency(sgstAmount)}</span>
          </div>
          <div className="totals-line">
            <span className="tl-label">Round Off</span>
            <span className="tl-value">
              {roundOff >= 0 ? "+" : ""}
              {formatCurrency(roundOff)}
            </span>
          </div>
          <div className="totals-line grand">
            <span className="tl-label">GRAND TOTAL</span>
            <span className="tl-value">₹ {formatCurrency(grandTotal)}</span>
          </div>
        </div>
        {grandTotal > 0 && (
          <div className="amount-words-box">
            <span className="aw-label">Amount in Words</span>
            {numberToWords(Math.round(grandTotal))}
          </div>
        )}
      </div>
    </div>
  );
}
