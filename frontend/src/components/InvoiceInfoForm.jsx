import React from 'react';
import { formatCurrency } from '../utils/helpers';

export default function InvoiceInfoForm({ form, onChange, grandTotal }) {
  return (
    <div className="tab-section">
      <div className="tab-section-header">
        <span className="tab-section-icon">📄</span>
        <div>
          <h2 className="tab-section-title">Invoice Info</h2>
          <p className="tab-section-sub">Document type, number, date and GST rates</p>
        </div>
      </div>

      {/* Grand Total Banner */}
      <div className="grand-total-banner">
        <div className="gt-label">Grand Total (Live)</div>
        <div className="gt-amount">₹ {formatCurrency(grandTotal)}</div>
      </div>

      {/* Type + Invoice Number */}
      <div className="fields-grid-2">
        <div className="form-field-group">
          <label className="field-label">Document Type</label>
          <div className="type-toggle">
            {['INVOICE', 'QUOTATION'].map(t => (
              <button
                key={t}
                type="button"
                className={`type-btn ${form.type === t ? 'active' : ''}`}
                onClick={() => onChange('type', t)}
              >
                {t === 'INVOICE' ? '🧾' : '📋'} {t}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field-group">
          <label className="field-label">
            Invoice Number <span className="required">*</span>
          </label>
          <div className="input-with-icon">
            <span className="input-icon">#</span>
            <input
              type="text"
              className="field-input has-icon mono"
              placeholder="e.g. INV-26-010 or JARS-2026-15"
              value={form.invoiceNumber}
              onChange={e => onChange('invoiceNumber', e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="field-hint">Letters, numbers, hyphens and slashes allowed</div>
        </div>
      </div>

      {/* Date + GST */}
      <div className="fields-grid-2">
        <div className="form-field-group">
          <label className="field-label">Invoice Date <span className="required">*</span></label>
          <div className="input-with-icon">
            <span className="input-icon">📅</span>
            <input
              type="date"
              className="field-input has-icon"
              value={form.date?.split('T')[0] || ''}
              onChange={e => onChange('date', e.target.value)}
            />
          </div>
        </div>

        <div className="form-field-group">
          <label className="field-label">GST Rates</label>
          <div className="gst-rates-row">
            <div className="gst-rate-field">
              <span className="gst-rate-label">CGST %</span>
              <input
                type="number"
                className="field-input gst-input"
                min="0" max="28"
                value={form.cgstPercent}
                onChange={e => onChange('cgstPercent', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="gst-rate-sep">+</div>
            <div className="gst-rate-field">
              <span className="gst-rate-label">SGST %</span>
              <input
                type="number"
                className="field-input gst-input"
                min="0" max="28"
                value={form.sgstPercent}
                onChange={e => onChange('sgstPercent', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="gst-rate-sep">=</div>
            <div className="gst-rate-total">
              {(parseFloat(form.cgstPercent) || 0) + (parseFloat(form.sgstPercent) || 0)}% GST
            </div>
          </div>
        </div>
      </div>

      {/* Notes + Bank */}
      <div className="fields-grid-2">
        <div className="form-field-group">
          <label className="field-label">Terms & Notes</label>
          <textarea
            className="field-input field-textarea"
            rows={5}
            placeholder="Terms and conditions..."
            value={form.notes}
            onChange={e => onChange('notes', e.target.value)}
          />
        </div>
        <div className="form-field-group">
          <label className="field-label">Bank Details</label>
          <textarea
            className="field-input field-textarea"
            rows={5}
            placeholder="Bank account details..."
            value={form.bankDetails}
            onChange={e => onChange('bankDetails', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}