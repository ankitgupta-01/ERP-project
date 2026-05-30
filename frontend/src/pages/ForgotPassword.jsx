import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { authAPI } from '../utils/api';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');

    if (!identifier.trim()) {
      setError('Enter your email or phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ identifier });
      setMessage(res.data.message);
      if (res.data.resetToken) setResetToken(res.data.resetToken);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not generate reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset access" subtitle="Generate a temporary reset token.">
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}
        {resetToken && (
          <div className="auth-token-box">
            <span>Reset token</span>
            <code>{resetToken}</code>
            <Link to="/reset-password">Use this token</Link>
          </div>
        )}

        <label className="auth-field">
          <span>Email or phone number</span>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        </label>

        <button className="auth-submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate reset token'}
        </button>

        <p className="auth-switch">
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
