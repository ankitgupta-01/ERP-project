import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { authAPI } from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.token || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(form);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Use your reset token to secure the account.">
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-alert error">{error}</div>}

        <label className="auth-field">
          <span>Reset token</span>
          <input name="token" value={form.token} onChange={handleChange} />
        </label>

        <label className="auth-field">
          <span>New password</span>
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </label>

        <label className="auth-field">
          <span>Confirm password</span>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </label>

        <button className="auth-submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
