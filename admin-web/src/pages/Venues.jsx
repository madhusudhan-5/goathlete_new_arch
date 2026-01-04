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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Venue Management</h2>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded p-3 mb-3">
        <div className="row">
          <div className="col-md-6">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name, city, or executive email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="col-md-3">
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PRE_REGISTERED">Pre-Registered</option>
              <option value="REGISTERED">Registered</option>
            </Form.Select>
          </div>
          <div className="col-md-3">
            <div className="text-muted">
              Showing {filteredVenues.length} of {venues.length} venues
            </div>
          </div>
        </div>
      </div>

      {/* Venues Table */}
      <div className="bg-white shadow-sm rounded p-3">
        <Table responsive hover>
          <thead>
            <tr>
              <th>Venue Name</th>
              <th>Location</th>
              <th>Executive</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Courts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVenues.map((venue) => (
              <tr key={venue.id}>
                <td>
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
                  <Badge bg="info">{venue.courts_count}</Badge>
                </td>
                <td>
                  {venue.status === 'PRE_REGISTERED' ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusChange(venue.id, 'REGISTERED')}
                      title="Approve and mark as Registered"
                    >
                      <FaCheckCircle className="me-1" />
                      Approve
                    </Button>
                  ) : (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleStatusChange(venue.id, 'PRE_REGISTERED')}
                      title="Mark as Pre-Registered"
                    >
                      <FaTimesCircle className="me-1" />
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

