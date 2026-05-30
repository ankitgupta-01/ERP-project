import React from 'react';

export default function ClientForm({ client, onChange }) {
  const set = (field, val) => onChange({ ...client, [field]: val });

  return (
    <div className="tab-section">
      <div className="tab-section-header">
        <span className="tab-section-icon">👤</span>
        <div>
          <h2 className="tab-section-title">Client Details</h2>
          <p className="tab-section-sub">Who is this invoice being sent to?</p>
        </div>
      </div>

      <div className="form-field-group">
        <label className="field-label">Client / M/S Name <span className="required">*</span></label>
        <div className="input-with-icon">
          <span className="input-icon">🏛️</span>
          <input className="field-input has-icon" placeholder="e.g. PRIMA PREFAB" value={client.name} onChange={e => set('name', e.target.value)} />
        </div>
      </div>

      <div className="form-field-group">
        <label className="field-label">Billing Address</label>
        <textarea className="field-input field-textarea" placeholder="Client's full billing address..." rows={3} value={client.address} onChange={e => set('address', e.target.value)} />
      </div>

      <div className="fields-grid-2">
        <div className="form-field-group">
          <label className="field-label">Site At (Work Location)</label>
          <div className="input-with-icon">
            <span className="input-icon">📍</span>
            <input className="field-input has-icon" placeholder="e.g. GREEN FIELD FARM, PADRA" value={client.siteAt} onChange={e => set('siteAt', e.target.value)} />
          </div>
        </div>
        <div className="form-field-group">
          <label className="field-label">Client GSTIN</label>
          <input className="field-input mono" placeholder="e.g. 24ASCPT3442P1ZC" value={client.gstin} onChange={e => set('gstin', e.target.value)} />
        </div>
      </div>

      {client.name && (
        <div className="preview-card">
          <div className="preview-card-label">Preview</div>
          <div className="preview-card-name">{client.name}</div>
          {client.address  && <div className="preview-card-detail">{client.address}</div>}
          {client.siteAt   && <div className="preview-card-detail">📍 Site: {client.siteAt}</div>}
          {client.gstin    && <div className="preview-card-gstin">{client.gstin}</div>}
        </div>
      )}
    </div>
  );
}