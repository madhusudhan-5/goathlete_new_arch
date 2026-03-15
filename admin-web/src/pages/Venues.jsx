import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { FaSearch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import venueService from '../services/venueService';

function Venues() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [searchTerm, statusFilter, venues]);

  const fetchVenues = async () => {
    try {
      const data = await venueService.getAll();
      setVenues(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError('Failed to load venues');
      setLoading(false);
    }
  };

  const filterVenues = () => {
    let filtered = venues;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((venue) => venue.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((venue) =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.executive.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVenues(filtered);
  };

  const handleStatusChange = async (venueId, newStatus) => {
    try {
      await venueService.updateStatus(venueId, newStatus);
      fetchVenues();
    } catch (error) {
      setError('Failed to update venue status');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'REGISTERED') {
      return <Badge bg="success" className="badge-status">REGISTERED</Badge>;
    }
    return <Badge bg="warning" text="dark" className="badge-status">PRE-REGISTERED</Badge>;
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <h3 className="fw-bold text-brand-navy">Venue Tenants Management</h3>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <div className="bg-white shadow-sm border-0 rounded-4 p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-light border-0">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                className="border-0 bg-light"
                placeholder="Search by name, city, or executive email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="col-md-3 mb-3 mb-md-0">
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-0 bg-light shadow-sm"
            >
              <option value="ALL">All Status</option>
              <option value="PRE_REGISTERED">Pre-Registered</option>
              <option value="REGISTERED">Registered</option>
            </Form.Select>
          </div>
          <div className="col-md-3 text-md-end">
            <Badge bg="light" text="dark" className="p-2 border border-secondary shadow-sm">
              Showing <strong className="text-brand-orange">{filteredVenues.length}</strong> of {venues.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Venues Table */}
      <div className="bg-white shadow-sm border-0 rounded-4 p-4">
        <Table responsive hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Venue Name</th>
              <th>Location</th>
              <th>Executive</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Courts</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVenues.map((venue) => (
              <tr key={venue.id}>
                <td className="fw-bold text-brand-navy">
                  <strong>{venue.name}</strong>
                </td>
                <td>
                  {venue.city}, {venue.state}
                  <br />
                  <small className="text-muted">{venue.pincode}</small>
                </td>
                <td>
                  {venue.executive.user.first_name} {venue.executive.user.last_name}
                  <br />
                  <small className="text-muted">{venue.executive.user.email}</small>
                </td>
                <td>
                  {venue.phone}
                  <br />
                  <small className="text-muted">{venue.email}</small>
                </td>
                <td>{getStatusBadge(venue.status)}</td>
                <td>
                  <Badge bg="dark" className="px-3 py-2 rounded-pill shadow-sm">{venue.courts_count}</Badge>
                </td>
                <td className="text-end">
                  {venue.status === 'PRE_REGISTERED' ? (
                    <Button
                      variant="success"
                      size="sm"
                      className="rounded-pill px-3 shadow-sm fw-bold"
                      onClick={() => handleStatusChange(venue.id, 'REGISTERED')}
                      title="Approve and mark as Registered"
                    >
                      <FaCheckCircle className="me-2" />
                      Approve
                    </Button>
                  ) : (
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="rounded-pill px-3 fw-bold"
                      onClick={() => handleStatusChange(venue.id, 'PRE_REGISTERED')}
                      title="Mark as Pre-Registered"
                    >
                      <FaTimesCircle className="me-2" />
                      Revert
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {filteredVenues.length === 0 && (
          <div className="text-center text-muted py-5">
            No venues found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}

export default Venues;

