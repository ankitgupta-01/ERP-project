import React from 'react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <div className="auth-brand-mark">IP</div>
          <h1>InvoicePro</h1>
          <p>Secure GST invoicing and quotations for every business workspace.</p>
          <div className="auth-points">
            <span>Private documents</span>
            <span>JWT protected</span>
            <span>User-wise billing data</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
