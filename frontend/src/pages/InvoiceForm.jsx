import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DashboardTabs from '../components/DashboardTabs';
import { invoiceAPI } from '../utils/api';
import { DEFAULT_COMPANY, DEFAULT_ITEM, numberToWords } from '../utils/helpers';

const today = () => new Date().toISOString().split('T')[0];

const initState = (type = 'INVOICE') => ({
  type,
  date: today(),
  invoiceNumber: '',
  company: { ...DEFAULT_COMPANY },
  client: { name: '', address: '', siteAt: '', gstin: '' },
  items: [DEFAULT_ITEM()],
  cgstPercent: 9,
  sgstPercent: 9,
  notes: '1. ALUMINIUM: AADARSH EXTRUSION\n2. COLOR: GREY WITH GUARANTEED POWDER COATED\n3. EXTRA ITEM CHARGES ON EXTRA ITEMS\n4. GST 18% CHARGES EXTRA',
  bankDetails: 'Bank: State Bank of India\nA/C Name: Jaynath Aluminium & Roofing System\nA/C No: XXXXXXXXXXXXXXXX\nIFSC: SBIN0XXXXXX\nBranch: Makarpura, Vadodara',
});

function calcTotals(items, cgstPercent, sgstPercent) {
  const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const cgstAmount  = parseFloat(((totalAmount * cgstPercent) / 100).toFixed(2));
  const sgstAmount  = parseFloat(((totalAmount * sgstPercent) / 100).toFixed(2));
  const sub         = totalAmount + cgstAmount + sgstAmount;
  const roundOff    = parseFloat((Math.round(sub) - sub).toFixed(2));
  const grandTotal  = parseFloat((sub + roundOff).toFixed(2));
  return { totalAmount, cgstAmount, sgstAmount, roundOff, grandTotal };
}

export default function InvoiceForm() {
  const { id }             = useParams();
  const [searchParams]     = useSearchParams();
  const navigate           = useNavigate();
  const isEdit             = !!id;

  const [form, setForm]       = useState(initState(searchParams.get('type') || 'INVOICE'));
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      invoiceAPI.getOne(id).then(res => {
        const d = res.data;
        setForm({
          ...d,
          items: d.items.map(it => ({ ...it, id: Date.now() + Math.random() })),
        });
        setLoading(false);
      });
    } else {
      const t = searchParams.get('type') || 'INVOICE';
      setForm(f => ({ ...f, type: t }));
    }
  }, [id]);

  const totals = calcTotals(form.items, form.cgstPercent, form.sgstPercent);

  const handleSave = async () => {
    if (!form.invoiceNumber?.trim()) {
      alert('Please enter an Invoice Number before saving.\n\nGo to the "Invoice Info" tab and fill in the number.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        invoiceNumber: form.invoiceNumber.trim(),
        ...totals,
        amountInWords: numberToWords(Math.round(totals.grandTotal)),
      };
      if (isEdit) await invoiceAPI.update(id, payload);
      else        await invoiceAPI.create(payload);
      navigate('/');
    } catch (err) {
      alert('Error saving: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <span>Loading invoice...</span>
    </div>
  );

  return (
    <div className="invoice-form-page">
      <div className="form-page-header">
        <div className="form-page-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div>
            <h1 className="form-page-title">
              {isEdit ? '✏️ Edit' : '✨ New'} {form.type === 'QUOTATION' ? 'Quotation' : 'Invoice'}
            </h1>
            <p className="form-page-sub">
              {form.invoiceNumber ? form.invoiceNumber : 'Enter number in Invoice Info tab →'}
            </p>
          </div>
        </div>
        <div className="form-page-header-right">
          <div className="header-grand-total">
            <span className="hgt-label">Total</span>
            <span className="hgt-val">
              ₹ {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button className="header-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      <DashboardTabs
        form={form}
        setForm={setForm}
        totals={totals}
        onSave={handleSave}
        saving={saving}
        isEdit={isEdit}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}