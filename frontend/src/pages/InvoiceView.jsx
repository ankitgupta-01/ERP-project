import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceAPI } from "../utils/api";
import { formatCurrency, formatDate } from "../utils/helpers";
import ShareBillModal from "../components/ShareBillModal";

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    invoiceAPI.getOne(id).then((res) => {
      setInvoice(res.data);
      setLoading(false);
    });
  }, [id]);

  const handlePDF = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      windowWidth: printRef.current.scrollWidth,
      windowHeight: printRef.current.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 6;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const imageRatio = canvas.width / canvas.height;
    let renderWidth = maxWidth;
    let renderHeight = renderWidth / imageRatio;

    if (renderHeight > maxHeight) {
      renderHeight = maxHeight;
      renderWidth = renderHeight * imageRatio;
    }

    pdf.addImage(
      imgData,
      "PNG",
      (pageWidth - renderWidth) / 2,
      margin,
      renderWidth,
      renderHeight,
    );
    pdf.save(`${invoice.invoiceNumber || "invoice"}.pdf`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading invoice...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>Invoice not found</div>
    );
  }

  const {
    company,
    client,
    items = [],
    type,
    invoiceNumber,
    date,
    totalAmount,
    cgstPercent,
    sgstPercent,
    cgstAmount,
    sgstAmount,
    roundOff,
    grandTotal,
    amountInWords,
    notes,
    bankDetails,
  } = invoice;

  return (
    <div>
      <div className="no-print inv-toolbar">
        <div>
          <h1 className="page-title">
            {type} - {invoiceNumber}
          </h1>
          <p className="page-subtitle">
            {client?.name} | {formatDate(date)}
          </p>
        </div>

        <div className="inv-toolbar-actions">
          <button className="btn btn-outline" onClick={() => navigate("/")}>
            Back
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate(`/edit/${id}`)}
          >
            Edit
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>
            Print
          </button>
          <button className="btn btn-primary" onClick={() => setShowShare(true)}>
            Share
          </button>
          <button className="btn btn-accent" onClick={handlePDF}>
            Download PDF
          </button>
        </div>
      </div>

      {showShare && invoice && (
        <ShareBillModal
          invoice={invoice}
          onClose={() => setShowShare(false)}
        />
      )}

      <div ref={printRef} className="inv-page-layout">
        <div className="invoice-preview">
          <div className="inv-header">
            <div className="inv-header-left">
              {company?.logo && (
                <img
                  src={company.logo}
                  alt="logo"
                  className="inv-header-logo"
                />
              )}
              <div className="inv-header-info">
                <div className="inv-company-name">{company?.name}</div>
                <div className="inv-company-sub">{company?.address}</div>
                <div className="inv-company-contact">
                  {company?.phone && (
                    <span className="inv-contact-chip">
                      Phone: {company.phone}
                    </span>
                  )}
                  {company?.email && (
                    <span className="inv-contact-chip">
                      Email: {company.email}
                    </span>
                  )}
                </div>
                {company?.gstin && (
                  <div className="gstin-badge">GSTIN: {company.gstin}</div>
                )}
              </div>
            </div>

            <div className="inv-right-info">
              <div className="inv-type-badge">{type}</div>
              <div className="inv-meta-card">
                <div className="inv-meta-row">
                  <span className="inv-meta-key">No.</span>
                  <span className="inv-meta-val">{invoiceNumber}</span>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-key">Date</span>
                  <span className="inv-meta-val">{formatDate(date)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="inv-accent-bar" />

          <div className="inv-parties">
            <div className="inv-party">
              <div className="inv-party-label">Bill To: M/S</div>
              <div className="inv-party-name">{client?.name}</div>
              {client?.address && (
                <div className="inv-party-detail inv-party-address">
                  {client.address}
                </div>
              )}
              {client?.gstin && (
                <div className="inv-party-gstin">
                  <span className="gstin-badge">GSTIN: {client.gstin}</span>
                </div>
              )}
              {client?.siteAt && (
                <div className="inv-party-detail inv-party-site">
                  Site: {client.siteAt}
                </div>
              )}
            </div>

            <div className="inv-party inv-party-meta">
              <div className="inv-party-label">Document Details</div>
              <div className="inv-meta-grid">
                <div className="inv-meta-field">
                  <span className="inv-meta-key">Invoice No.</span>
                  <span className="inv-meta-val">{invoiceNumber}</span>
                </div>
                <div className="inv-meta-field">
                  <span className="inv-meta-key">Date</span>
                  <span className="inv-meta-val">{formatDate(date)}</span>
                </div>
                <div className="inv-meta-field">
                  <span className="inv-meta-key">Type</span>
                  <span className="inv-meta-val">{type}</span>
                </div>
                <div className="inv-meta-field">
                  <span className="inv-meta-key">Items</span>
                  <span className="inv-meta-val">{items.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="inv-table-wrap">
            <table className="inv-table">
              <colgroup>
                <col className="col-sr" />
                <col className="col-desc" />
                <col className="col-hsn" />
                <col className="col-size" />
                <col className="col-qty" />
                <col className="col-nos" />
                <col className="col-per" />
                <col className="col-rate" />
                <col className="col-amount" />
              </colgroup>
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Description</th>
                  <th>HSN/SAC</th>
                  <th>Size</th>
                  <th>QTY</th>
                  <th>NOS</th>
                  <th>PER</th>
                  <th>Rate</th>
                  <th className="td-r">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="td-muted">{idx + 1}</td>
                    <td>{item.description}</td>
                    <td>{item.hsnSacCode}</td>
                    <td>
                      {item.sizeA && item.sizeB
                        ? `${item.sizeA}x${item.sizeB} ${item.sizeUnit}`
                        : "-"}
                    </td>
                    <td>{item.qty}</td>
                    <td>{item.nos}</td>
                    <td>{item.per}</td>
                    <td className="td-r">{formatCurrency(item.rate)}</td>
                    <td className="td-r td-bold">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="inv-footer">
            <div className="inv-totals">
              <div className="inv-totals-box">
                <div className="inv-total-row">
                  <span className="t-label">Total Amount</span>
                  <span className="t-val">Rs. {formatCurrency(totalAmount)}</span>
                </div>
                <div className="inv-total-row">
                  <span className="t-label">CGST ({cgstPercent}%)</span>
                  <span className="t-val">Rs. {formatCurrency(cgstAmount)}</span>
                </div>
                <div className="inv-total-row">
                  <span className="t-label">SGST ({sgstPercent}%)</span>
                  <span className="t-val">Rs. {formatCurrency(sgstAmount)}</span>
                </div>
                <div className="inv-total-row">
                  <span className="t-label">Round Off</span>
                  <span className="t-val">
                    {roundOff >= 0 ? "+" : ""}
                    {formatCurrency(roundOff)}
                  </span>
                </div>
                <div className="inv-total-row grand-row">
                  <span className="t-label">Grand Total</span>
                  <span className="t-val">Rs. {formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {amountInWords && (
              <div className="inv-words">
                <div className="inv-words-label">Amount in Words</div>
                <div className="inv-words-text">{amountInWords}</div>
              </div>
            )}

            {(notes || bankDetails) && (
              <div className="inv-notes">
                {notes && (
                  <div className="inv-notes-block">
                    <label>Terms & Notes</label>
                    <p>{notes}</p>
                  </div>
                )}
                {bankDetails && (
                  <div className="inv-notes-block">
                    <label>Bank Details</label>
                    <p>{bankDetails}</p>
                  </div>
                )}
              </div>
            )}

            <div className="inv-sign-row">
              <div className="inv-sign-box">
                <div className="inv-sign-line" />
                <div className="inv-sign-label">Authorised Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
