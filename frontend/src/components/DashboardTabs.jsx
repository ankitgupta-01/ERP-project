import React, { useState } from 'react';
import CompanyForm      from './CompanyForm';
import ClientForm       from './ClientForm';
import InvoiceInfoForm  from './InvoiceInfoForm';
import ItemsForm        from './ItemsForm';

const TABS = [
  { id: 'company', label: 'Company',      short: 'Co.',    icon: '🏢' },
  { id: 'client',  label: 'Client',       short: 'Client', icon: '👤' },
  { id: 'info',    label: 'Invoice Info', short: 'Info',   icon: '📄' },
  { id: 'items',   label: 'Items',        short: 'Items',  icon: '📦' },
];

export default function DashboardTabs({ form, setForm, totals, onSave, saving, onCancel }) {
  const [activeTab, setActiveTab] = useState('company');
  const activeIndex = TABS.findIndex(t => t.id === activeTab);

  const setCompany = val => setForm(f => ({ ...f, company: val }));
  const setClient  = val => setForm(f => ({ ...f, client: val }));
  const setField   = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setItems   = val => setForm(f => ({ ...f, items: val }));

  const goNext = () => { const n = TABS[activeIndex + 1]; if (n) setActiveTab(n.id); };
  const goPrev = () => { const p = TABS[activeIndex - 1]; if (p) setActiveTab(p.id); };

  return (
    <div className="dtabs-wrapper">

      {/* ── Tab Bar ── */}
      <div className="dtabs-bar-wrap">
        <div className="dtabs-bar">
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              className={`dtab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="dtab-icon">{tab.icon}</span>
              <span className="dtab-label">{tab.label}</span>
              <span className="dtab-label-short">{tab.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="dtabs-content">
        {activeTab === 'company' && <CompanyForm     company={form.company} onChange={setCompany} />}
        {activeTab === 'client'  && <ClientForm      client={form.client}   onChange={setClient} />}
        {activeTab === 'info'    && <InvoiceInfoForm form={form} onChange={setField} grandTotal={totals.grandTotal} />}
        {activeTab === 'items'   && (
          <ItemsForm
            items={form.items}
            onChange={setItems}
            totals={{ ...totals, cgstPercent: form.cgstPercent, sgstPercent: form.sgstPercent }}
            onTotalsChange={setField}
          />
        )}
      </div>

      {/* ── Footer Nav ── */}
      <div className="dtabs-footer">
        <div className="dtabs-footer-left">
          {activeIndex > 0
            ? <button className="footer-nav-btn prev" onClick={goPrev}>← {TABS[activeIndex - 1].label}</button>
            : <button className="footer-nav-btn cancel" onClick={onCancel}>✕ Cancel</button>
          }
        </div>

        <div className="dtabs-footer-center">
          <div className="dtabs-progress">
            {TABS.map((tab, i) => (
              <div
                key={tab.id}
                className={`progress-dot ${i === activeIndex ? 'active' : ''} ${i < activeIndex ? 'done' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              />
            ))}
          </div>
        </div>

        <div className="dtabs-footer-right">
          {activeIndex < TABS.length - 1
            ? <button className="footer-nav-btn next" onClick={goNext}>{TABS[activeIndex + 1].label} →</button>
            : <button className="footer-save-btn" onClick={onSave} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Invoice'}</button>
          }
        </div>
      </div>
    </div>
  );
}