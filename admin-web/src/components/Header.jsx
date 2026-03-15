import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBell, FaSignOutAlt } from 'react-icons/fa';
import authService from '../services/authService';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/executives': 'Executives & Staff',
  '/venues': 'Venue Partners',
};

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 60,
        background: '#fff',
        borderBottom: '1px solid #e9eef4',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Admin</span>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span style={{ fontWeight: 700, color: '#0A1F35', fontSize: '0.9rem' }}>{pageTitle}</span>
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notification bell */}
        <button
          style={{ border: 'none', background: '#f1f5f9', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
          title="Notifications"
        >
          <FaBell size={15} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: '#e2e8f0', margin: '0 8px' }} />

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #0A1F35, #1e3a5f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            }}
          >
            {(user?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A1F35', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || 'Admin'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#DA6F2B', fontWeight: 600 }}>
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: '#e2e8f0', margin: '0 8px' }} />

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: 10,
            padding: '7px 12px', cursor: 'pointer', color: '#ef4444',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#fee2e2'; }}
          title="Logout"
        >
          <FaSignOutAlt size={13} /> Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
