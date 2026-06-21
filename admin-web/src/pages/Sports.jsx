import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FaFutbol, FaPlus, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import api from '../services/api';

const DEFAULT_SPORT_TEMPLATES = {
    CRICKET: {
        scoring_fields: ['runs', 'wickets', 'overs', 'balls', 'fours', 'sixes', 'catches'],
        player_stat_fields: ['runs', 'balls_faced', 'fours', 'sixes', 'wickets', 'overs_bowled', 'economy'],
        player_roles: ['batsman', 'bowler', 'allrounder', 'wicketkeeper'],
    },
    FOOTBALL: {
        scoring_fields: ['goals', 'assists', 'yellow_cards', 'red_cards'],
        player_stat_fields: ['goals', 'assists', 'passes', 'tackles', 'yellow_cards', 'red_cards'],
        player_roles: ['goalkeeper', 'defender', 'midfielder', 'forward'],
    },
    BASKETBALL: {
        scoring_fields: ['points', 'rebounds', 'assists', 'steals', 'blocks'],
        player_stat_fields: ['points', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers'],
        player_roles: ['point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center'],
    },
    DEFAULT: {
        scoring_fields: ['score'],
        player_stat_fields: ['score'],
        player_roles: ['player'],
    },
};

function SportFormModal({ sport, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: '',
        code: '',
        icon: '🏆',
        description: '',
        is_active: true,
        scoring_fields_raw: '[]',
        player_stat_fields_raw: '[]',
        player_roles_raw: '[]',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (sport) {
            const tmpl = sport.scoreboard_template || {};
            setForm({
                name: sport.name || '',
                code: sport.code || '',
                icon: sport.icon || '🏆',
                description: sport.description || '',
                is_active: sport.is_active !== false,
                scoring_fields_raw: JSON.stringify(tmpl.scoring_fields || [], null, 2),
                player_stat_fields_raw: JSON.stringify(tmpl.player_stat_fields || [], null, 2),
                player_roles_raw: JSON.stringify(tmpl.player_roles || [], null, 2),
            });
        } else {
            const tmpl = DEFAULT_SPORT_TEMPLATES.DEFAULT;
            setForm(f => ({
                ...f,
                scoring_fields_raw: JSON.stringify(tmpl.scoring_fields, null, 2),
                player_stat_fields_raw: JSON.stringify(tmpl.player_stat_fields, null, 2),
                player_roles_raw: JSON.stringify(tmpl.player_roles, null, 2),
            }));
        }
    }, [sport]);

    const applyTemplate = (code) => {
        const tmpl = DEFAULT_SPORT_TEMPLATES[code] || DEFAULT_SPORT_TEMPLATES.DEFAULT;
        setForm(f => ({
            ...f,
            scoring_fields_raw: JSON.stringify(tmpl.scoring_fields, null, 2),
            player_stat_fields_raw: JSON.stringify(tmpl.player_stat_fields, null, 2),
            player_roles_raw: JSON.stringify(tmpl.player_roles, null, 2),
        }));
    };

    const handleSave = async () => {
        setError('');
        let scoring_fields, player_stat_fields, player_roles;
        try {
            scoring_fields = JSON.parse(form.scoring_fields_raw);
            player_stat_fields = JSON.parse(form.player_stat_fields_raw);
            player_roles = JSON.parse(form.player_roles_raw);
        } catch {
            setError('Invalid JSON in one of the fields. Please check formatting.');
            return;
        }
        if (!form.name.trim() || !form.code.trim()) {
            setError('Name and Code are required.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                icon: form.icon,
                description: form.description,
                is_active: form.is_active,
                scoreboard_template: { scoring_fields, player_stat_fields, player_roles },
            };
            if (sport) {
                await api.patch(`/tournaments/sports/${sport.id}/`, payload);
            } else {
                await api.post('/tournaments/sports/', payload);
            }
            onSaved();
        } catch (e) {
            setError(e?.response?.data?.detail || JSON.stringify(e?.response?.data) || 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const title = sport ? `Edit Sport: ${sport.name}` : 'Add New Sport';

    return (
        <Modal show onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}

                <Row className="g-3">
                    <Col md={6}>
                        <Form.Label>Sport Name *</Form.Label>
                        <Form.Control
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Cricket"
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Code * (UPPERCASE)</Form.Label>
                        <Form.Control
                            value={form.code}
                            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                            placeholder="e.g. CRICKET"
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Icon (Emoji)</Form.Label>
                        <Form.Control
                            value={form.icon}
                            onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                            placeholder="🏆"
                        />
                    </Col>
                    <Col md={12}>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        />
                    </Col>
                    <Col md={12}>
                        <Form.Check
                            type="switch"
                            label="Sport is Active (visible to players)"
                            checked={form.is_active}
                            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                        />
                    </Col>
                </Row>

                <hr />
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold mb-0">Scoreboard Template</h6>
                    <Form.Select
                        size="sm"
                        style={{ width: 180 }}
                        defaultValue=""
                        onChange={e => e.target.value && applyTemplate(e.target.value)}
                    >
                        <option value="">Apply template…</option>
                        {Object.keys(DEFAULT_SPORT_TEMPLATES).filter(k => k !== 'DEFAULT').map(k => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </Form.Select>
                </div>

                <Row className="g-3">
                    <Col md={12}>
                        <Form.Label className="fw-semibold">
                            Scoring Fields <small className="text-muted fw-normal">(JSON array of field keys shown on scoreboard)</small>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={form.scoring_fields_raw}
                            onChange={e => setForm(f => ({ ...f, scoring_fields_raw: e.target.value }))}
                            style={{ fontFamily: 'monospace', fontSize: 13 }}
                        />
                    </Col>
                    <Col md={6}>
                        <Form.Label className="fw-semibold">
                            Player Stat Fields <small className="text-muted fw-normal">(JSON array)</small>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={form.player_stat_fields_raw}
                            onChange={e => setForm(f => ({ ...f, player_stat_fields_raw: e.target.value }))}
                            style={{ fontFamily: 'monospace', fontSize: 13 }}
                        />
                    </Col>
                    <Col md={6}>
                        <Form.Label className="fw-semibold">
                            Player Roles <small className="text-muted fw-normal">(JSON array)</small>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={form.player_roles_raw}
                            onChange={e => setForm(f => ({ ...f, player_roles_raw: e.target.value }))}
                            style={{ fontFamily: 'monospace', fontSize: 13 }}
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? <Spinner size="sm" className="me-1" /> : null}
                    {sport ? 'Save Changes' : 'Create Sport'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function Sports() {
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editSport, setEditSport] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tournaments/sports/');
            setSports(Array.isArray(res.data) ? res.data : res.data.results || []);
        } catch (e) {
            console.error('Failed to load sports', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const toggleActive = async (sport) => {
        try {
            await api.patch(`/tournaments/sports/${sport.id}/`, { is_active: !sport.is_active });
            load();
        } catch (e) {
            alert('Failed to update sport status');
        }
    };

    const openEdit = (sport) => { setEditSport(sport); setShowForm(true); };
    const openCreate = () => { setEditSport(null); setShowForm(true); };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                    <h2 className="mb-0 fw-bold text-brand-navy">Sports Management</h2>
                    <p className="text-muted mb-4">Configure sports and their scoreboard templates</p>
                </div>
                <Button variant="primary" style={{ backgroundColor: '#DA6F2B', borderColor: '#DA6F2B' }} onClick={openCreate}>
                    <FaPlus className="me-2" /> Add Sport
                </Button>
            </div>

            {/* Summary */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="shadow-sm border-0 rounded-4">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: 1 }}>Total Sports</h6>
                                <h2 className="mb-0 fw-bold" style={{ color: '#0A1F35' }}>{sports.length}</h2>
                            </div>
                            <div className="p-3 bg-light rounded-circle" style={{ color: '#0A1F35', fontSize: 22 }}><FaFutbol /></div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 rounded-4">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: 1 }}>Active</h6>
                                <h2 className="mb-0 fw-bold" style={{ color: '#198754' }}>{sports.filter(s => s.is_active).length}</h2>
                            </div>
                            <div className="p-3 bg-light rounded-circle text-success" style={{ fontSize: 22 }}><FaToggleOn /></div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0 rounded-4">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Icon</th>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th>Scoring Fields</th>
                                    <th>Player Roles</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sports.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center text-muted py-4">No sports configured</td></tr>
                                ) : sports.map(s => {
                                    const tmpl = s.scoreboard_template || {};
                                    return (
                                        <tr key={s.id}>
                                            <td style={{ fontSize: 28 }}>{s.icon}</td>
                                            <td className="fw-bold">{s.name}</td>
                                            <td><code>{s.code}</code></td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {(tmpl.scoring_fields || []).map(f => (
                                                        <Badge key={f} bg="secondary" className="fw-normal">{f}</Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {(tmpl.player_roles || []).map(r => (
                                                        <Badge key={r} bg="info" text="dark" className="fw-normal">{r}</Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={s.is_active ? 'success' : 'secondary'}>
                                                    {s.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(s)}>
                                                    <FaEdit className="me-1" /> Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={s.is_active ? 'outline-danger' : 'outline-success'}
                                                    onClick={() => toggleActive(s)}
                                                >
                                                    {s.is_active ? <><FaToggleOff className="me-1" /> Disable</> : <><FaToggleOn className="me-1" /> Enable</>}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {showForm && (
                <SportFormModal
                    sport={editSport}
                    onClose={() => setShowForm(false)}
                    onSaved={() => { setShowForm(false); load(); }}
                />
            )}
        </div>
    );
}

export default Sports;
