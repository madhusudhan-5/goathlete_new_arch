import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import executiveService from '../services/executiveService';

function Executives() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExecutives();
  }, []);

  const fetchExecutives = async () => {
    try {
      const data = await executiveService.getAll();
      setExecutives(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching executives:', error);
      setError('Failed to load executives');
      setLoading(false);
    }
  };

  const handleShowModal = (executive = null) => {
    if (executive) {
      setEditingExecutive(executive);
      setFormData({
        email: executive.user.email,
        password: '',
        first_name: executive.user.first_name,
        last_name: executive.user.last_name,
        phone: executive.phone,
      });
    } else {
      setEditingExecutive(null);
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExecutive(null);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingExecutive) {
        await executiveService.update(editingExecutive.id, formData);
      } else {
        await executiveService.create(formData);
      }
      handleCloseModal();
      fetchExecutives();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save executive');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this executive?')) {
      try {
        await executiveService.delete(id);
        fetchExecutives();
      } catch (error) {
        setError('Failed to delete executive');
      }
    }
  };

  const handleToggleStatus = async (executive) => {
    try {
      await executiveService.toggleStatus(executive.id, !executive.user.is_active);
      fetchExecutives();
    } catch (error) {
      setError('Failed to update executive status');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <h3 className="fw-bold text-brand-navy">Executive Staff Management</h3>
        <Button className="btn-brand-orange py-2 px-4 rounded-pill fw-bold" onClick={() => handleShowModal()}>
          <FaPlus className="me-2" />
          Add Executive
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="bg-white shadow-sm border-0 rounded-4 p-4">
        <Table responsive hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {executives.map((executive) => (
              <tr key={executive.id}>
                <td className="fw-bold text-brand-navy">
                  {executive.user.first_name} {executive.user.last_name}
                </td>
                <td>{executive.user.email}</td>
                <td>{executive.phone}</td>
                <td>
                  {executive.user.is_active ? (
                    <Badge bg="success">Active</Badge>
                  ) : (
                    <Badge bg="danger">Inactive</Badge>
                  )}
                </td>
                <td>{new Date(executive.created_at).toLocaleDateString()}</td>
                <td className="table-actions">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(executive)}
                    title="Edit"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant={executive.user.is_active ? 'outline-warning' : 'outline-success'}
                    size="sm"
                    onClick={() => handleToggleStatus(executive)}
                    title={executive.user.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {executive.user.is_active ? <FaToggleOff /> : <FaToggleOn />}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(executive.id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingExecutive ? 'Edit Executive' : 'Add New Executive'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingExecutive}
              />
            </Form.Group>

            {!editingExecutive && (
              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Form.Text className="text-muted">
                  Executive will use OTP for login. This is for initial setup only.
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone *</Form.Label>
              <Form.Control
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button className="btn-brand-orange" type="submit">
              {editingExecutive ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Executives;

