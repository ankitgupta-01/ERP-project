import React, { useEffect, useState } from 'react';
import { adminAPI } from '../utils/api';
import { formatCurrency } from '../utils/helpers';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([adminAPI.users(), adminAPI.analytics()])
      .then(([usersRes, analyticsRes]) => {
        setUsers(usersRes.data);
        setAnalytics(analyticsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id, role) => {
    await adminAPI.updateRole(id, role);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all billing data?')) return;
    await adminAPI.deleteUser(id);
    load();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading admin...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin</h1>
          <p className="page-subtitle">Platform users and billing analytics</p>
        </div>
      </div>

      {analytics && (
        <div className="stats-grid">
          <div className="stat-card"><div><div className="stat-value">{analytics.users}</div><div className="stat-label">Users</div></div></div>
          <div className="stat-card"><div><div className="stat-value">{analytics.documents}</div><div className="stat-label">Documents</div></div></div>
          <div className="stat-card"><div><div className="stat-value">{analytics.invoices}</div><div className="stat-label">Invoices</div></div></div>
          <div className="stat-card"><div><div className="stat-value">Rs. {formatCurrency(analytics.revenue)}</div><div className="stat-label">Revenue</div></div></div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.businessName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <select
                    className="admin-role-select"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
