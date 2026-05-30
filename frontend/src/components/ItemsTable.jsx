import React from 'react';
import { PER_OPTIONS, UNIT_OPTIONS, DEFAULT_ITEM } from '../utils/helpers';

export default function ItemsTable({ items, onChange }) {

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };

      const a = field === 'sizeA' ? parseFloat(value) : parseFloat(newItem.sizeA);
      const b = field === 'sizeB' ? parseFloat(value) : parseFloat(newItem.sizeB);
      if (!isNaN(a) && !isNaN(b) && a > 0 && b > 0) {
        newItem.qty = parseFloat((a * b).toFixed(4));
      } else {
        newItem.qty = '';
      }

      const qty = newItem.qty !== '' ? parseFloat(newItem.qty) : 0;
      const rate = field === 'rate' ? parseFloat(value) : parseFloat(newItem.rate) || 0;
      newItem.amount = parseFloat((qty * rate).toFixed(2));

      return newItem;
    });
    onChange(updated);
  };

  const addRow = () => onChange([...items, DEFAULT_ITEM()]);
  const removeRow = (index) => { if (items.length > 1) onChange(items.filter((_, i) => i !== index)); };

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>Sr</th>
              <th style={{ minWidth: 180, textAlign: 'left', paddingLeft: 10 }}>Description</th>
              <th style={{ width: 80 }}>HSN/SAC</th>
              <th style={{ width: 140 }}>Size (A × B)</th>
              <th style={{ width: 70 }}>Unit</th>
              <th style={{ width: 75 }}>QTY</th>
              <th style={{ width: 55 }}>NOS</th>
              <th style={{ width: 80 }}>PER</th>
              <th style={{ width: 80 }}>RATE</th>
              <th style={{ width: 90 }}>AMOUNT</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td style={{ textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: 12 }}>{idx + 1}</td>
                <td>
                  <input className="table-input text-left" placeholder="Item description..." value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                </td>
                <td>
                  <input className="table-input" placeholder="7610" value={item.hsnSacCode} onChange={e => updateItem(idx, 'hsnSacCode', e.target.value)} />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <input className="table-input" style={{ width: '45%' }} type="number" placeholder="A" value={item.sizeA} onChange={e => updateItem(idx, 'sizeA', e.target.value)} />
                    <span style={{ color: '#9ca3af', fontWeight: 700, fontSize: 14 }}>×</span>
                    <input className="table-input" style={{ width: '45%' }} type="number" placeholder="B" value={item.sizeB} onChange={e => updateItem(idx, 'sizeB', e.target.value)} />
                  </div>
                </td>
                <td>
                  <select className="table-input" value={item.sizeUnit} onChange={e => updateItem(idx, 'sizeUnit', e.target.value)}>
                    {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </td>
                <td>
                  <input className="table-input readonly" readOnly value={item.qty !== '' && item.qty !== undefined ? item.qty : ''} placeholder="Auto" tabIndex={-1} />
                </td>
                <td>
                  <input className="table-input" type="number" min="1" value={item.nos} onChange={e => updateItem(idx, 'nos', e.target.value)} />
                </td>
                <td>
                  <select className="table-input" value={item.per} onChange={e => updateItem(idx, 'per', e.target.value)}>
                    {PER_OPTIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </td>
                <td>
                  <input className="table-input" type="number" placeholder="0.00" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} />
                </td>
                <td>
                  <input className="table-input readonly" style={{ fontFamily: 'var(--mono)' }} readOnly value={item.amount ? item.amount.toFixed(2) : '0.00'} tabIndex={-1} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeRow(idx)} disabled={items.length === 1} style={{ fontSize: 13 }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10 }}>
        <button className="btn btn-outline btn-sm" onClick={addRow}>+ Add Item</button>
      </div>
    </div>
  );
}