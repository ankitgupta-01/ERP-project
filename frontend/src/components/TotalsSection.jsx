import React from 'react';
import { formatCurrency, numberToWords } from '../utils/helpers';

export default function TotalsSection({ totals, onChange }) {
  const { totalAmount, cgstPercent, sgstPercent, cgstAmount, sgstAmount, roundOff, grandTotal } = totals;

  return (
    <div>
      <div className="totals-section">
        <div className="totals-row">
          <span className="label">Total Amount</span>
          <span className="value">₹ {formatCurrency(totalAmount)}</span>
        </div>
        <div className="totals-row">
          <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            CGST
            <input className="gst-input" type="number" value={cgstPercent} onChange={e => onChange('cgstPercent', parseFloat(e.target.value) || 0)} min="0" max="28" />
            %
          </span>
          <span className="value">₹ {formatCurrency(cgstAmount)}</span>
        </div>
        <div className="totals-row">
          <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            SGST
            <input className="gst-input" type="number" value={sgstPercent} onChange={e => onChange('sgstPercent', parseFloat(e.target.value) || 0)} min="0" max="28" />
            %
          </span>
          <span className="value">₹ {formatCurrency(sgstAmount)}</span>
        </div>
        <div className="totals-row">
          <span className="label">Sub Total</span>
          <span className="value">₹ {formatCurrency(totalAmount + cgstAmount + sgstAmount)}</span>
        </div>
        <div className="totals-row">
          <span className="label">Round Off</span>
          <span className="value">{roundOff >= 0 ? '+' : ''}{formatCurrency(roundOff)}</span>
        </div>
        <div className="totals-row grand">
          <span className="label">GRAND TOTAL</span>
          <span className="value">₹ {formatCurrency(grandTotal)}</span>
        </div>
      </div>
      <div className="amount-words">
        <span>Amount in Words:</span>
        {numberToWords(Math.round(grandTotal))}
      </div>
    </div>
  );
}