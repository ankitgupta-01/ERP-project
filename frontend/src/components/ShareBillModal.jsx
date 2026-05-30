import React, { useState, useEffect } from "react";
import {
  shareAPI,
  copyToClipboard,
  whatsappShare,
  emailShare,
} from "../utils/shareUtils";

export default function ShareBillModal({ invoice, onClose }) {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ viewCount: 0, downloads: 0 });
  const [revoking, setRevoking] = useState(false);
  const [hasShare, setHasShare] = useState(false);

  useEffect(() => {
    loadOrCreate();
  }, []);

  const loadOrCreate = async () => {
    setLoading(true);
    try {
      // Check if share already exists
      const statsRes = await shareAPI.getStats(invoice._id);
      if (statsRes.data.hasShare) {
        setShareUrl(statsRes.data.shareUrl);
        setStats({
          viewCount: statsRes.data.viewCount,
          downloads: statsRes.data.downloads,
        });
        setHasShare(true);
      } else {
        // Create new share
        const res = await shareAPI.createShare(invoice._id);
        setShareUrl(res.data.shareUrl);
        setHasShare(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRevoke = async () => {
    if (
      !window.confirm(
        "Revoke this share link? Anyone with the link will lose access.",
      )
    )
      return;
    setRevoking(true);
    await shareAPI.revokeShare(invoice._id);
    setHasShare(false);
    setShareUrl("");
    setRevoking(false);
  };

  return (
    <div className="smodal-overlay" onClick={onClose}>
      <div className="smodal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="smodal-header">
          <div className="smodal-title-row">
            <span className="smodal-icon">🔗</span>
            <div>
              <div className="smodal-title">Share Bill</div>
              <div className="smodal-sub">
                {invoice.invoiceNumber} · {invoice.type}
              </div>
            </div>
          </div>
          <button className="smodal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="smodal-loading">
            <div className="smodal-spinner" />
            <span>Generating link...</span>
          </div>
        ) : (
          <>
            {/* Stats row */}
            {hasShare && (
              <div className="smodal-stats">
                <div className="smodal-stat">
                  <span className="sstat-icon">👁</span>
                  <div className="sstat-num">{stats.viewCount}</div>
                  <div className="sstat-lbl">Views</div>
                </div>
                <div className="smodal-stat">
                  <span className="sstat-icon">⬇️</span>
                  <div className="sstat-num">{stats.downloads}</div>
                  <div className="sstat-lbl">Downloads</div>
                </div>
                <div className="smodal-stat">
                  <span className="sstat-icon">✅</span>
                  <div className="sstat-num">Active</div>
                  <div className="sstat-lbl">Status</div>
                </div>
              </div>
            )}

            {/* Link box */}
            <div className="smodal-link-section">
              <label className="smodal-label">Shareable Link</label>
              <div className="smodal-link-box">
                <input
                  className="smodal-link-input"
                  value={shareUrl}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <button
                  className={`smodal-copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="smodal-label" style={{ marginBottom: 10 }}>
              Share via
            </div>
            <div className="smodal-share-btns">
              <button
                className="sshare-btn whatsapp"
                onClick={() => whatsappShare(shareUrl, invoice.invoiceNumber)}
              >
                <span>💬</span> WhatsApp
              </button>
              <button
                className="sshare-btn email"
                onClick={() => emailShare(shareUrl, invoice.invoiceNumber)}
              >
                <span>✉️</span> Email
              </button>
              <button className="sshare-btn copy-link" onClick={handleCopy}>
                <span>🔗</span> {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            {/* Info */}
            <div className="smodal-info">
              <span>ℹ️</span>
              Anyone with this link can view and download this bill. No login
              required.
            </div>

            {/* Revoke */}
            {hasShare && (
              <div className="smodal-footer">
                <button
                  className="smodal-revoke"
                  onClick={handleRevoke}
                  disabled={revoking}
                >
                  {revoking ? "Revoking..." : "🗑 Revoke Link"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
