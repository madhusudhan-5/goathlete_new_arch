import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FaChartBar, FaUsers, FaBuilding } from 'react-icons/fa';

function Sidebar() {
  return (
    <div className="sidebar p-3">
      <div className="mb-4 text-center">
        <h4 className="fw-bold">Menu</h4>
      </div>
      
      <Nav className="flex-column sidebar-nav">
        <Nav.Item>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaChartBar className="me-2" />
            Dashboard
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/executives" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaUsers className="me-2" />
            Executives
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/venues" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaBuilding className="me-2" />
            Venues
          </NavLink>
        </Nav.Item>
      </Nav>
    </div>
  );
}

export default Sidebar;

