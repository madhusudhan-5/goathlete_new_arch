import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FaTrophy, FaSearch, FaEye, FaLock, FaUsers } from 'react-icons/fa';
import api from '../services/api';

const STATUS_VARIANTS = {
    ACTIVE: 'success',
    COMPLETED: 'secondary',
    UPCOMING: 'primary',
    ONGOING: 'warning',
    CANCELLED: 'danger',
    DRAFT: 'light',
};

const STATUS_LABELS = {
    ACTIVE: '🟢 Active',
    COMPLETED: '⬛ Completed',
    UPCOMING: '🔵 Upcoming',
    ONGOING: '🟡 Ongoing',
    CANCELLED: '🔴 Cancelled',
    DRAFT: '⬜ Draft',
};

function TournamentDetailModal({ tournament, onClose, onScoreUpdate }) {
    const [participants, setParticipants] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editScores, setEditScores] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (tournament) {
            setParticipants(tournament.participants || []);
        }
    }, [tournament]);

    const handleEditScore = (p) => {
        setEditingId(p.id);
        setEditScores({ ...p.score });
    };

    const handleSaveScore = async (participantId) => {
        setSaving(true);
        try {
            const res = await api.patch(
                `/tournaments/local-tournaments/${tournament.id}/participant/${participantId}/score/`,
                { score: editScores }
            );
            setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, score: editScores } : p));
            setEditingId(null);
            if (onScoreUpdate) onScoreUpdate();
        } catch (e) {
            alert('Failed to update score: ' + (e?.response?.data?.detail || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleClose = async () => {
        if (!window.confirm('Are you sure you want to close this tournament?')) return;
        try {
            await api.post(`/tournaments/local-tournaments/${tournament.id}/close/`);
            alert('Tournament closed successfully.');
            onClose(true);
        } catch (e) {
            alert('Failed to close: ' + (e?.response?.data?.detail || 'Unknown error'));
        }
    };

    if (!tournament) return null;

    const scoreKeys = participants.length > 0
        ? Object.keys(participants[0]?.score || {})
        : [];

    return (
        <Modal show onHide={() => onClose(false)} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    {tournament.sport_name} &mdash; {tournament.name}
                    <Badge bg={STATUS_VARIANTS[tournament.status] || 'secondary'} className="ms-2">
                        {tournament.status}
                    </Badge>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                    <Col>
                        <strong>Sport:</strong> {tournament.sport_name}
                    </Col>
                    <Col>
                        <strong>Players:</strong> {participants.length}
                    </Col>
                    <Col>
                        <strong>Created:</strong> {new Date(tournament.created_at).toLocaleDateString()}
                    </Col>
                </Row>

                <h6 className="fw-bold mb-2">Scoreboard</h6>
                <Table striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            {scoreKeys.map(k => <th key={k} className="text-capitalize">{k}</th>)}
                            {tournament.status === 'ACTIVE' && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {[...participants]
                            .sort((a, b) => (b.score?.[scoreKeys[0]] ?? 0) - (a.score?.[scoreKeys[0]] ?? 0))
                            .map((p, idx) => (
                                <tr key={p.id}>
                                    <td className="fw-bold">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                    </td>
                                    <td>{p.name}</td>
                                    <td>{p.email}</td>
                                    <td>{p.mobile}</td>
                                    {scoreKeys.map(k => (
                                        <td key={k}>
                                            {editingId === p.id ? (
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    value={editScores[k] ?? 0}
                                                    onChange={e => setEditScores(prev => ({ ...prev, [k]: parseFloat(e.target.value) || 0 }))}
                                                    style={{ width: 70 }}
                                                />
                                            ) : (
                                                <span className="fw-bold">{p.score?.[k] ?? 0}</span>
                                            )}
                                        </td>
                                    ))}
                                    {tournament.status === 'ACTIVE' && (
                                        <td>
                                            {editingId === p.id ? (
                                                <>
                                                    <Button size="sm" variant="success" className="me-1"
                                                        onClick={() => handleSaveScore(p.id)} disabled={saving}>
                                                        {saving ? <Spinner size="sm" /> : '✓ Save'}
                                                    </Button>
                                                    <Button size="sm" variant="outline-secondary" onClick={() => setEditingId(null)}>
                                                        ✕
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="outline-primary" onClick={() => handleEditScore(p)}>
                                                    ✏️ Edit
                                                </Button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                {tournament.status === 'ACTIVE' && (
                    <Button variant="danger" onClick={handleClose}>
                        🏁 Close Tournament
                    </Button>
                )}
                <Button variant="secondary" onClick={() => onClose(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, local: 0 });

    const load = async () => {
        setLoading(true);
        try {
            // Fetch local tournaments (admin sees all)
            const res = await api.get('/tournaments/local-tournaments/');
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];

            // Fetch formal tournaments
            const fRes = await api.get('/tournaments/tournaments/');
            const fData = Array.isArray(fRes.data) ? fRes.data : fRes.data.results || [];

            const combined = [
                ...data.map(t => ({ ...t, _type: 'local' })),
                ...fData.map(t => ({ ...t, _type: 'formal' })),
            ];

            setTournaments(combined);
            setStats({
                total: combined.length,
                active: combined.filter(t => t.status === 'ACTIVE' || t.status === 'ONGOING').length,
                completed: combined.filter(t => t.status === 'COMPLETED').length,
                local: data.length,
            });
        } catch (e) {
            console.error('Failed to load tournaments', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = tournaments.filter(t => {
        const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase()) ||
            t.sport_name?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'ALL' || t._type === typeFilter.toLowerCase();
        const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    return (
        <div>
            <h2 className="mb-1 fw-bold text-brand-navy">Tournaments</h2>
            <p className="text-muted mb-4">Manage all platform tournaments and scoreboards</p>

            {/* Stat Cards */}
            <Row className="mb-4">
                {[
                    { label: 'Total', value: stats.total, color: '#0A1F35', icon: <FaTrophy /> },
                    { label: 'Active / Ongoing', value: stats.active, color: '#2ECC71', icon: <FaTrophy /> },
                    { label: 'Completed', value: stats.completed, color: '#6c757d', icon: <FaTrophy /> },
                    { label: 'Local (Informal)', value: stats.local, color: '#DA6F2B', icon: <FaUsers /> },
                ].map((c, i) => (
                    <Col md={3} key={i}>
                        <Card className="shadow-sm border-0 rounded-4 mb-3">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>{c.label}</h6>
                                        <h2 className="mb-0 fw-bold" style={{ color: c.color }}>{c.value}</h2>
                                    </div>
                                    <div className="p-3 bg-light rounded-circle" style={{ color: c.color, fontSize: 22 }}>{c.icon}</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters */}
            <Card className="shadow-sm border-0 rounded-4 mb-4">
                <Card.Body className="p-3">
                    <Row className="g-2 align-items-center">
                        <Col md={5}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <FaSearch className="text-muted" />
                                </span>
                                <Form.Control
                                    placeholder="Search by name or sport..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border-start-0 ps-0"
                                />
                            </div>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                                <option value="ALL">All Types</option>
                                <option value="LOCAL">Local (Informal)</option>
                                <option value="FORMAL">Formal</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ONGOING">Ongoing</option>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </Form.Select>
                        </Col>
                        <Col md={1}>
                            <Button variant="outline-secondary" size="sm" onClick={load} title="Refresh">↺</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Table */}
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Tournament Name</th>
                                    <th>Sport</th>
                                    <th>Type</th>
                                    <th>Players</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center text-muted py-4">No tournaments found</td></tr>
                                ) : filtered.map((t, i) => (
                                    <tr key={`${t._type}-${t.id}`}>
                                        <td className="text-muted">{i + 1}</td>
                                        <td className="fw-bold">{t.name}</td>
                                        <td>{t.sport_name || t.sport || '—'}</td>
                                        <td>
                                            <Badge bg={t._type === 'local' ? 'warning' : 'info'} text="dark">
                                                {t._type === 'local' ? 'Local' : 'Formal'}
                                            </Badge>
                                        </td>
                                        <td>{t.participants?.length ?? t.participants_count ?? '—'}</td>
                                        <td>
                                            <Badge bg={STATUS_VARIANTS[t.status] || 'secondary'}>
                                                {t.status}
                                            </Badge>
                                        </td>
                                        <td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => setSelected(t)}
                                            >
                                                <FaEye className="me-1" /> View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {selected && (
                <TournamentDetailModal
                    tournament={selected}
                    onClose={(refresh) => { setSelected(null); if (refresh) load(); }}
                    onScoreUpdate={load}
                />
            )}
        </div>
    );
}

export default Tournaments;
