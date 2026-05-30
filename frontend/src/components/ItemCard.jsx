import React from 'react';
import { PER_OPTIONS, UNIT_OPTIONS, formatCurrency } from '../utils/helpers';

export default function ItemCard({ item, index, onChange, onDelete, canDelete }) {

  const update = (field, value) => {
    const updated = { ...item, [field]: value };

    // Safe numeric helpers — never NaN / null / undefined
    const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
    const has = v => { const n = parseFloat(v); return isFinite(n) && n > 0; };

    const a    = field === 'sizeA' ? num(value) : num(updated.sizeA);
    const b    = field === 'sizeB' ? num(value) : num(updated.sizeB);
    const nos  = field === 'nos'   ? num(value) : num(updated.nos);
    const rate = field === 'rate'  ? num(value) : num(updated.rate);

    const sizeA    = field === 'sizeA' ? parseFloat(value) : parseFloat(updated.sizeA);
    const sizeB    = field === 'sizeB' ? parseFloat(value) : parseFloat(updated.sizeB);
    const hasSizeA = has(sizeA);
    const hasSizeB = has(sizeB);
    const hasNos   = has(nos);

    // ── CASE 1: Both sizes → Qty = SizeA × SizeB × NOS ──
    if (hasSizeA && hasSizeB) {
      const effectiveNos = hasNos ? nos : 1;
      updated.qty    = parseFloat((a * b * effectiveNos).toFixed(4));
      updated.amount = parseFloat((updated.qty * rate).toFixed(2));

    // ── CASE 2: No sizes, NOS provided → Qty = NOS ──
    } else if (hasNos) {
      updated.qty    = nos;
      updated.amount = parseFloat((nos * rate).toFixed(2));

    // ── CASE 3: Only Rate → Qty = 1, Amount = Rate ──
    } else {
      updated.qty    = rate > 0 ? 1 : '';
      updated.amount = parseFloat(rate.toFixed(2));
    }

    onChange(updated);
  };

  // ── Calc hint renderer ──
  const renderCalcHint = () => {
    if (!item.amount || item.amount <= 0) return null;

    const a   = parseFloat(item.sizeA);
    const b   = parseFloat(item.sizeB);
    const nos = parseFloat(item.nos);
    const r   = parseFloat(item.rate);
    const hasA = isFinite(a) && a > 0;
    const hasB = isFinite(b) && b > 0;
    const hasN = isFinite(nos) && nos > 0;

    // Case 1 — full size
    if (hasA && hasB) {
      const effNos = hasN ? nos : 1;
      return (
        <div className="calc-hint">
          {a} × {b}{effNos > 1 ? ` × ${effNos}` : ''} = <strong>{item.qty} {item.sizeUnit}²</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          {item.qty} × ₹{r} = <strong>₹ {formatCurrency(item.amount)}</strong>
        </div>
      );
    }

    // Case 2 — NOS only
    if (hasN) {
      return (
        <div className="calc-hint">
          {nos} NOS × ₹{r} = <strong>₹ {formatCurrency(item.amount)}</strong>
        </div>
      );
    }

    // Case 3 — rate only
    return (
      <div className="calc-hint">
        1 × ₹{r} = <strong>₹ {formatCurrency(item.amount)}</strong>
      </div>
    );
  };

  return (
    <div className="item-card">

      {/* ── Card Header ── */}
      <div className="item-card-header">
        <div className="item-card-num">Item #{index + 1}</div>
        <div className="item-card-amount-preview">
          {item.amount > 0
            ? <span className="amount-live">₹ {formatCurrency(item.amount)}</span>
            : <span className="amount-empty">₹ 0.00</span>
          }
        </div>
        {canDelete && (
          <button className="item-delete-btn" onClick={onDelete} title="Remove item">
            ✕
          </button>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="item-card-body">

        {/* Row 1: Description + HSN/SAC */}
        <div className="fields-grid-2">
          <div className="form-field-group">
            <label className="field-label">Description</label>
            <input
              className="field-input"
              placeholder="e.g. R-70 DOOR WITH FRAME 8mm FLUTED GLASS"
              value={item.description}
              onChange={e => update('description', e.target.value)}
            />
          </div>
          <div className="form-field-group">
            <label className="field-label">HSN / SAC Code</label>
            <input
              className="field-input mono"
              placeholder="e.g. 7610"
              value={item.hsnSacCode}
              onChange={e => update('hsnSacCode', e.target.value)}
            />
          </div>
        </div>

        {/* Row 2: Size A × Size B + Unit → QTY (all optional) */}
        <div className="size-row">
          <div className="form-field-group size-field">
            <label className="field-label">Size A <span className="field-optional">(opt)</span></label>
            <input
              className="field-input center"
              type="number"
              placeholder="3"
              value={item.sizeA}
              onChange={e => update('sizeA', e.target.value)}
            />
          </div>
          <div className="size-multiply">×</div>
          <div className="form-field-group size-field">
            <label className="field-label">Size B <span className="field-optional">(opt)</span></label>
            <input
              className="field-input center"
              type="number"
              placeholder="6"
              value={item.sizeB}
              onChange={e => update('sizeB', e.target.value)}
            />
          </div>
          <div className="form-field-group size-unit-field">
            <label className="field-label">Unit</label>
            <select
              className="field-input"
              value={item.sizeUnit}
              onChange={e => update('sizeUnit', e.target.value)}
            >
              {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="size-equals">=</div>
          <div className="form-field-group qty-result-field">
            <label className="field-label">QTY <span className="auto-tag">Auto</span></label>
            <div className="qty-result-box">
              {item.qty !== '' && item.qty !== undefined && item.qty > 0
                ? <>
                    <span className="qty-val">{item.qty}</span>
                    {parseFloat(item.sizeA) > 0 && parseFloat(item.sizeB) > 0 &&
                      <span className="qty-unit">{item.sizeUnit}²</span>
                    }
                  </>
                : <span className="qty-placeholder">—</span>
              }
            </div>
          </div>
        </div>

        {/* Row 3: NOS + PER + Rate → Amount */}
        <div className="calc-row">
          <div className="form-field-group">
            <label className="field-label">NOS <span className="field-optional">(opt)</span></label>
            <input
              className="field-input center"
              type="number"
              min="1"
              placeholder="1"
              value={item.nos}
              onChange={e => update('nos', e.target.value)}
            />
          </div>
          <div className="form-field-group">
            <label className="field-label">PER</label>
            <select
              className="field-input"
              value={item.per}
              onChange={e => update('per', e.target.value)}
            >
              {PER_OPTIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-field-group">
            <label className="field-label">Rate (₹) <span className="required">*</span></label>
            <input
              className="field-input mono"
              type="number"
              placeholder="0.00"
              value={item.rate}
              onChange={e => update('rate', e.target.value)}
            />
          </div>
          <div className="form-field-group">
            <label className="field-label">Amount <span className="auto-tag">Auto</span></label>
            <div className={`amount-result-box ${item.amount > 0 ? 'has-value' : ''}`}>
              ₹ {item.amount ? formatCurrency(item.amount) : '0.00'}
            </div>
          </div>
        </div>

        {/* Calc hint — live formula display */}
        {renderCalcHint()}

      </div>
    </div>
  );
}