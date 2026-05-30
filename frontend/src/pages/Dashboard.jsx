import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const navigate                = useNavigate();

  const load = () => {
    setLoading(true);
    invoiceAPI.getAll().then(res => {
      setInvoices(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    await invoiceAPI.delete(id);
    load();
  };

  const filtered =
    filter === 'ALL'
      ? invoices
      : invoices.filter(i => i.type === filter);

  const stats = {
    total:      invoices.length,
    invoices:   invoices.filter(i => i.type === 'INVOICE').length,
    quotations: invoices.filter(i => i.type === 'QUOTATION').length,
    revenue:    invoices
      .filter(i => i.type === 'INVOICE')
      .reduce((s, i) => s + (i.grandTotal || 0), 0),
  };

  return (
    <div>

      {/* ── Page Header ── */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">📋 Documents</h1>
          <p className="page-subtitle">All invoices &amp; quotations</p>
        </div>
        <div className="dashboard-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/new?type=INVOICE')}
          >
            + Invoice
          </button>
          <button
            className="btn btn-accent"
            onClick={() => navigate('/new?type=QUOTATION')}
          >
            + Quotation
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📄</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🧾</div>
          <div>
            <div className="stat-value">{stats.invoices}</div>
            <div className="stat-label">Invoices</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">📋</div>
          <div>
            <div className="stat-value">{stats.quotations}</div>
            <div className="stat-label">Quotes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div>
            <div className="stat-value">
              ₹{stats.revenue >= 1000
                ? `${Math.round(stats.revenue / 1000)}K`
                : Math.round(stats.revenue)}
            </div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="filter-tabs">
        {['ALL', 'INVOICE', 'QUOTATION'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <span className="filter-count">
          {filtered.length} document{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <span>Loading...</span>
        </div>
      ) : filtered.length === 0 ? (

        /* ── Empty State ── */
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>No documents yet</p>
          <small>Create your first invoice or quotation to get started</small>
        </div>

      ) : (
        <div className="invoice-list">

          {/* ── Desktop/Tablet Header — hidden on mobile via CSS ── */}
          {/* <div className="invoice-list-header">
            <div>Number</div>
            <div>Client</div>
            <div className="col-date">Date</div>
            <div className="col-type">Type</div>
            <div className="col-amount">Amount</div>
            <div className="col-actions">Actions</div>
          </div> */}

          {/* ── Invoice Rows ── */}
          {filtered.map(inv => (
            <div
              key={inv._id}
              className="invoice-row"
              onClick={() => navigate(`/view/${inv._id}`)}
            >
              {/* ── LINE 1 (mobile card top): Number + Amount ── */}
              <div className="invoice-row-line1">
                <div className="invoice-num">{inv.invoiceNumber}</div>
                <div className="invoice-amount col-amount">
                  ₹ {formatCurrency(inv.grandTotal)}
                </div>
              </div>

              {/* ── LINE 2 (mobile card bottom): Client + Type + Actions ── */}
              <div className="invoice-row-line2">
                <div className="col-client">
                  <div className="invoice-client">
                    {inv.client?.name || '—'}
                  </div>
                </div>
                <div className="col-type">
                  <span
                    className={`badge ${
                      inv.type === 'INVOICE'
                        ? 'badge-invoice'
                        : 'badge-quotation'
                    }`}
                  >
                    {inv.type === 'INVOICE' ? 'INV' : 'QUO'}
                  </span>
                </div>
                <div
                  className="actions-cell col-actions"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="btn btn-outline btn-sm btn-icon"
                    title="View"
                    onClick={() => navigate(`/view/${inv._id}`)}
                  >
                    👁
                  </button>
                  <button
                    className="btn btn-outline btn-sm btn-icon"
                    title="Edit"
                    onClick={() => navigate(`/edit/${inv._id}`)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    title="Delete"
                    onClick={e => handleDelete(e, inv._id)}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* ── Desktop-only cells (visible via grid on ≥576px) ── */}
              <div className="invoice-date col-date">
                {formatDate(inv.date)}
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}