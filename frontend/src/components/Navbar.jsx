import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Invoice<span>Pro</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className="nav-btn">Dashboard</Link>
        <button className="nav-btn primary" onClick={() => navigate('/new?type=INVOICE')}>
          + Invoice
        </button>
        <button
          className="nav-btn"
          style={{ background: 'rgba(200,134,10,0.35)', borderColor: '#c8860a' }}
          onClick={() => navigate('/new?type=QUOTATION')}
        >
          + Quotation
        </button>
        {isAdmin && <Link to="/admin" className="nav-btn">Admin</Link>}
        <span className="nav-user">{user?.businessName || user?.fullName}</span>
        <button className="nav-btn nav-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
