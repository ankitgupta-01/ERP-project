import React from 'react';

export default function CompanyForm({ company, onChange }) {
  const set = (field, val) => onChange({ ...company, [field]: val });

  const handleLogoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('logo', reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="tab-section">
      <div className="tab-section-header">
        <span className="tab-section-icon">🏢</span>
        <div>
          <h2 className="tab-section-title">Company Details</h2>
          <p className="tab-section-sub">Your business info printed on every invoice</p>
        </div>
      </div>

      {/* Logo */}
      <div className="form-field-group">
        <label className="field-label">Company Logo</label>
        <label htmlFor="logo-upload" className="logo-upload-box">
          {company.logo
            ? <div className="logo-preview-wrap"><img src={company.logo} alt="logo" className="logo-img" /><span className="logo-change-hint">Click to change</span></div>
            : <div className="logo-upload-placeholder"><span className="logo-upload-icon">📷</span><span className="logo-upload-text">Upload Logo</span><span className="logo-upload-hint">PNG, JPG up to 5MB</span></div>
          }
        </label>
        <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
      </div>

      <div className="fields-grid-2">
        <div className="form-field-group">
          <label className="field-label">Company Name <span className="required">*</span></label>
          <input className="field-input" placeholder="e.g. JAYNATH ALUMINIUM & ROOFING SYSTEM" value={company.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-field-group">
          <label className="field-label">GSTIN</label>
          <input className="field-input mono" placeholder="e.g. 24AHSPG0673J1Z5" value={company.gstin} onChange={e => set('gstin', e.target.value)} />
        </div>
      </div>

      <div className="form-field-group">
        <label className="field-label">Address</label>
        <textarea className="field-input field-textarea" placeholder="Full business address..." rows={3} value={company.address} onChange={e => set('address', e.target.value)} />
      </div>

      <div className="fields-grid-2">
        <div className="form-field-group">
          <label className="field-label">Phone</label>
          <div className="input-with-icon">
            <span className="input-icon">📞</span>
            <input className="field-input has-icon" placeholder="Phone number" value={company.phone} onChange={e => set('phone', e.target.value)} />
          </div>
        </div>
        <div className="form-field-group">
          <label className="field-label">Email</label>
          <div className="input-with-icon">
            <span className="input-icon">✉️</span>
            <input className="field-input has-icon" placeholder="Email address" value={company.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}