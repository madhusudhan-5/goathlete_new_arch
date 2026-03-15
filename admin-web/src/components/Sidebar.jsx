import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaChartBar, FaUsers, FaBuilding, FaAngleRight, FaBars, FaTimes } from 'react-icons/fa';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/executives', label: 'Executives & Staff', icon: <FaUsers /> },
      { to: '/venues', label: 'Venue Partners', icon: <FaBuilding /> },
    ],
  },
];

function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside
      style={{ width: collapsed ? 72 : 250, minHeight: '100vh' }}
      className="sidebar d-flex flex-column transition-all"
      role="navigation"
    >
      {/* Logo */}
      <div
        className="d-flex align-items-center border-bottom py-4"
        style={{ borderColor: 'rgba(255,255,255,0.1)', padding: collapsed ? '1rem 0' : '1rem 1.25rem', justifyContent: collapsed ? 'center' : 'space-between' }}
      >
        {!collapsed && (
          <div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#DA6F2B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaBuilding color="#fff" size={14} />
              </div>
              <span className="text-white fw-bold fs-5" style={{ letterSpacing: '0.5px' }}>GoAthlete</span>
            </div>
            <div className="text-uppercase fw-bold mt-1" style={{ fontSize: '0.6rem', letterSpacing: '2px', color: '#DA6F2B', paddingLeft: 40 }}>
              Admin Portal
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#DA6F2B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaBuilding color="#fff" size={14} />
          </div>
        )}
        <button
          onClick={onToggle}
          className="btn btn-sm"
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: '4px 8px', marginLeft: collapsed ? 0 : 8 }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FaAngleRight size={12} /> : <FaBars size={12} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 py-3 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '8px 12px 4px' }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="d-flex align-items-center text-decoration-none mb-1"
                  style={{
                    padding: collapsed ? '10px 0' : '10px 12px',
                    borderRadius: 12,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: collapsed ? 0 : 12,
                    background: isActive ? '#DA6F2B' : 'transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 4px 14px rgba(218,111,43,0.3)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
                  title={collapsed ? item.label : undefined}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {!collapsed && <span className="ms-2">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom hint */}
      {!collapsed && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: 0 }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
            GoAthlete Platform v2.1
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
