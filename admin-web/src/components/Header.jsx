import React from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import authService from '../services/authService';

function Header() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand href="/dashboard" className="text-brand-navy fw-bold">
          GoAthlete Admin
        </Navbar.Brand>
        
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="text-decoration-none text-dark">
              <FaUserCircle size={24} className="me-2" />
              {user?.email}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;

