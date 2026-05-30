import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareAPI } from '../utils/shareUtils';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function PublicBillPage() {
  const { token }                   = useParams();
  const [step,    setStep]          = useState('verify'); // verify | bill | error
  const [contact, setContact]       = useState('');
  const [invoice, setInvoice]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState('');
  const [dlLoading, setDlLoading]   = useState(false);
  const printRef                    = useRef();

  // Load invoice on mount — no verification required (open access)
  useEffect(() => {
    fetchBill();
  }, []);

  const fetchBill = async () => {
    setLoading(true);
    try {
      const res = await shareAPI.getPublic(token);
      setInvoice(res.data.invoice);
      setStep('bill');
    } catch {
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDlLoading(true);
    try {
      await shareAPI.trackDL(token);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF }   = await import('jspdf');
      const canvas  = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w       = pdf.internal.pageSize.getWidth();
      const h       = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`${invoice.invoiceNumber || 'bill'}.pdf`);
    } catch (e) {
      alert('Download failed. Please try again.');
    } finally {
      setDlLoading(false);
    }
  };

  const handlePrint = () => window.print();

  // ── Loading ──
  if (loading) return (
    <div className="pub-loading">
      <div className="pub-spinner" />
      <p>Loading your bill...</p>
    </div>
  );

  // ── Error ──
  if (step === 'error') return (
    <div className="pub-error">
      <div className="pub-error-icon">🔗</div>
      <h2>Link Not Found</h2>
      <p>This link may have expired or been revoked by the sender.</p>
    </div>
  );

  if (!invoice) return null;

  const {
    company, client, items = [], type, invoiceNumber, date,
    totalAmount, cgstPercent, sgstPercent, cgstAmount, sgstAmount,
    roundOff, grandTotal, amountInWords, notes, bankDetails,
  } = invoice;

  return (
    <div className="pub-page">

      {/* ── Top Brand Bar ── */}
      <div className="pub-topbar">
        {company?.logo
          ? <img src={company.logo} alt="logo" className="pub-topbar-logo" />
          : <div className="pub-topbar-name">{company?.name}</div>
        }
        <div className="pub-topbar-type">{type}</div>
      </div>

      {/* ── Action Buttons (sticky) ── */}
      <div className="pub-actions no-print">
        <button className="pub-btn pub-btn-primary" onClick={handleDownload} disabled={dlLoading}>
          {dlLoading ? '⏳ Preparing...' : '⬇️ Download PDF'}
        </button>
        <button className="pub-btn pub-btn-outline" onClick={handlePrint}>
          🖨 Print
        </button>
        <button
          className="pub-btn pub-btn-whatsapp"
          onClick={() => {
            const url = window.location.href;
            const msg = encodeURIComponent(`View bill ${invoiceNumber}: ${url}`);
            window.open(`https://wa.me/?text=${msg}`, '_blank');
          }}
        >
          💬 Share
        </button>
      </div>

      {/* ── Bill Container ── */}
      <div className="pub-bill-wrap">
        <div ref={printRef} className="pub-bill">

          {/* Header */}
          <div className="pub-bill-header">
            <div className="pub-bill-company">
              {company?.logo && (
                <img src={company.logo} alt="logo" className="pub-bill-logo" />
              )}
              <div>
                <div className="pub-bill-co-name">{company?.name}</div>
                <div className="pub-bill-co-addr">{company?.address}</div>
                {company?.phone && (
                  <div className="pub-bill-co-contact">📞 {company.phone}</div>
                )}
                {company?.gstin && (
                  <div className="pub-bill-gstin">GSTIN: {company.gstin}</div>
                )}
              </div>
            </div>
            <div className="pub-bill-meta">
              <div className="pub-bill-type-badge">{type}</div>
              <div className="pub-bill-num">#{invoiceNumber}</div>
              <div className="pub-bill-date">{formatDate(date)}</div>
            </div>
          </div>

          {/* Divider */}
          <div className="pub-bill-divider" />

          {/* Client info */}
          <div className="pub-bill-parties">
            <div className="pub-bill-to">
              <div className="pub-party-label">Bill To</div>
              <div className="pub-party-name">{client?.name}</div>
              {client?.address && <div className="pub-party-addr">{client.address}</div>}
              {client?.siteAt  && <div className="pub-party-addr">📍 {client.siteAt}</div>}
              {client?.gstin   && <div className="pub-party-gstin">{client.gstin}</div>}
            </div>
          </div>

          {/* Items table */}
          <div className="pub-table-wrap">
            <table className="pub-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>HSN</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'pub-row-even' : ''}>
                    <td className="pub-td-center">{idx + 1}</td>
                    <td className="pub-td-left">{item.description}</td>
                    <td className="pub-td-center">{item.hsnSacCode || '—'}</td>
                    <td className="pub-td-center">
                      {item.sizeA && item.sizeB
                        ? `${item.sizeA}×${item.sizeB} ${item.sizeUnit}`
                        : '—'}
                    </td>
                    <td className="pub-td-center">{item.qty || item.nos || 1}</td>
                    <td className="pub-td-right">₹{formatCurrency(item.rate)}</td>
                    <td className="pub-td-right pub-td-bold">₹{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pub-totals">
            <div className="pub-totals-box">
              <div className="pub-total-row">
                <span>Subtotal</span>
                <span>₹{formatCurrency(totalAmount)}</span>
              </div>
              <div className="pub-total-row">
                <span>CGST ({cgstPercent}%)</span>
                <span>₹{formatCurrency(cgstAmount)}</span>
              </div>
              <div className="pub-total-row">
                <span>SGST ({sgstPercent}%)</span>
                <span>₹{formatCurrency(sgstAmount)}</span>
              </div>
              {roundOff !== 0 && (
                <div className="pub-total-row">
                  <span>Round Off</span>
                  <span>{roundOff > 0 ? '+' : ''}{formatCurrency(roundOff)}</span>
                </div>
              )}
              <div className="pub-total-row pub-grand-row">
                <span>Total Amount</span>
                <span>₹{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          {amountInWords && (
            <div className="pub-words">
              <span className="pub-words-label">Amount in Words: </span>
              {amountInWords}
            </div>
          )}

          {/* Notes + Bank */}
          {(notes || bankDetails) && (
            <div className="pub-footer-grid">
              {notes && (
                <div className="pub-footer-block">
                  <div className="pub-footer-label">Terms & Notes</div>
                  <div className="pub-footer-text">{notes}</div>
                </div>
              )}
              {bankDetails && (
                <div className="pub-footer-block">
                  <div className="pub-footer-label">Bank Details</div>
                  <div className="pub-footer-text">{bankDetails}</div>
                </div>
              )}
            </div>
          )}

          {/* Signature */}
          <div className="pub-sign-row">
            <div className="pub-sign-box">
              <div className="pub-sign-line" />
              <div className="pub-sign-label">Authorised Signatory</div>
            </div>
          </div>

          {/* Digital bill footer */}
          <div className="pub-bill-footer">
            <div className="pub-bill-footer-text">
              🔒 This is a digitally generated bill
            </div>
            <div className="pub-bill-footer-sub">
              Generated by InvoicePro · {new Date().getFullYear()}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom download bar (mobile sticky) ── */}
      <div className="pub-bottom-bar no-print">
        <div className="pub-bottom-amount">
          <div className="pub-bottom-label">Total Amount</div>
          <div className="pub-bottom-val">₹{formatCurrency(grandTotal)}</div>
        </div>
        <button className="pub-btn pub-btn-primary" onClick={handleDownload} disabled={dlLoading}>
          {dlLoading ? '⏳' : '⬇️ Download Bill'}
        </button>
      </div>

    </div>
  );
}