import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './Header';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <>
      <Header />
      <Container fluid>
        <Row>
          <Col md={2} className="p-0">
            <Sidebar />
          </Col>
          <Col md={10}>
            <div className="content-wrapper">
              {children}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Layout;

