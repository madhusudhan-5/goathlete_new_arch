import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table, Tab, Tabs } from 'react-bootstrap';
import { FaUsers, FaSearch, FaEye, FaTrophy, FaMedal, FaChartBar } from 'react-icons/fa';
import api from '../services/api';

const FITNESS_COLORS = {
    BEGINNER: '#6c757d',
    INTERMEDIATE: '#0d6efd',
    ADVANCED: '#fd7e14',
    PROFESSIONAL: '#198754',
};

function PlayerDetailModal({ player, onClose }) {
    const [sportStats, setSportStats] = useState([]);
    const [perfHistory, setPerfHistory] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!player) return;
        loadDetails();
    }, [player]);

    const loadDetails = async () => {
        setLoadingDetail(true);
        try {
            // We'll use admin endpoints if available, otherwise gracefully fail
            const [ss, ph] = await Promise.all([
                api.get(`/players/${player.id}/sport-stats/`).catch(() => ({ data: [] })),
                api.get(`/players/${player.id}/performance-history/`).catch(() => ({ data: [] })),
            ]);
            setSportStats(Array.isArray(ss.data) ? ss.data : []);
            setPerfHistory(Array.isArray(ph.data) ? ph.data : []);
        } catch {
        } finally {
            setLoadingDetail(false);
        }
    };

    if (!player) return null;

    const fullName = [player.first_name, player.last_name].filter(Boolean).join(' ') || player.email;

    return (
        <Modal show onHide={onClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className="me-2" style={{ fontSize: 32 }}>
                        {fullName.charAt(0).toUpperCase()}
                    </span>
                    {fullName}
                    {player.fitness_level && (
                        <Badge className="ms-2" style={{ backgroundColor: FITNESS_COLORS[player.fitness_level] }}>
                            {player.fitness_level}
                        </Badge>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} className="mb-3">
                    {/* Overview */}
                    <Tab eventKey="overview" title="Overview">
                        <Row>
                            <Col md={6}>
                                <Card className="border-0 bg-light mb-3">
                                    <Card.Body>
                                        <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: 1 }}>Profile</h6>
                                        {[
                                            { label: 'Email', value: player.email || player.user_email },
                                            { label: 'Phone', value: player.phone },
                                            { label: 'City', value: player.city || '—' },
                                            { label: 'Gender', value: player.gender || '—' },
                                            { label: 'Date of Birth', value: player.date_of_birth || '—' },
                                            { label: 'Fitness Level', value: player.fitness_level || '—' },
                                            { label: 'Height', value: player.height ? `${player.height} cm` : '—' },
                                            { label: 'Weight', value: player.weight ? `${player.weight} kg` : '—' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="d-flex justify-content-between py-2 border-bottom">
                                                <span className="text-muted">{label}</span>
                                                <span className="fw-bold">{value}</span>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border-0 bg-light mb-3">
                                    <Card.Body>
                                        <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: 1 }}>Career Stats</h6>
                                        {[
                                            { label: 'Total Matches', value: player.total_matches ?? 0, color: '#0A1F35' },
                                            { label: 'Total Tournaments', value: player.total_tournaments ?? 0, color: '#DA6F2B' },
                                            { label: 'Total Wins', value: player.total_wins ?? 0, color: '#2ECC71' },
                                            { label: 'Badges', value: (player.badges ?? []).length, color: '#F1C40F' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="d-flex justify-content-between py-2 border-bottom align-items-center">
                                                <span className="text-muted">{label}</span>
                                                <span className="fw-bold" style={{ color, fontSize: 18 }}>{value}</span>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>

                                {player.badges?.length > 0 && (
                                    <Card className="border-0 bg-light">
                                        <Card.Body>
                                            <h6 className="fw-bold text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: 1 }}>Badges</h6>
                                            <div className="d-flex flex-wrap gap-1">
                                                {player.badges.map(b => (
                                                    <Badge key={b} bg="warning" text="dark">{b}</Badge>
                                                ))}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                )}
                            </Col>
                        </Row>
                    </Tab>

                    {/* Sport Stats */}
                    <Tab eventKey="sports" title={`Sport Records (${sportStats.length})`}>
                        {loadingDetail ? <div className="text-center py-4"><Spinner /></div> : (
                            sportStats.length === 0 ? (
                                <div className="text-center text-muted py-4">No sport stats available</div>
                            ) : sportStats.map(ss => (
                                <Card key={ss.sport_code} className="mb-3 border-0 shadow-sm">
                                    <Card.Body>
                                        <h5 className="mb-3">
                                            <span className="me-2">{ss.sport_icon}</span>
                                            {ss.sport_name}
                                            <Badge bg="secondary" className="ms-2">{ss.matches} matches</Badge>
                                        </h5>
                                        <Row>
                                            {Object.entries(ss.aggregate_stats).map(([k, v]) => (
                                                <Col md={3} key={k}>
                                                    <div className="text-center p-2 bg-light rounded">
                                                        <div className="fw-bold" style={{ fontSize: 24, color: '#DA6F2B' }}>{typeof v === 'number' ? Math.round(v) : v}</div>
                                                        <small className="text-muted text-uppercase">{k}</small>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))
                        )}
                    </Tab>

                    {/* Performance History */}
                    <Tab eventKey="history" title={`History (${perfHistory.length})`}>
                        {loadingDetail ? <div className="text-center py-4"><Spinner /></div> : (
                            perfHistory.length === 0 ? (
                                <div className="text-center text-muted py-4">No performance history</div>
                            ) : (
                                <Table responsive striped hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Tournament</th>
                                            <th>Sport</th>
                                            <th>Type</th>
                                            <th>Result</th>
                                            <th>Stats</th>
                                            <th>Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {perfHistory.map((h, i) => (
                                            <tr key={i}>
                                                <td>{h.match_date}</td>
                                                <td>{h.tournament_name}</td>
                                                <td>{h.sport_icon} {h.sport_name}</td>
                                                <td>
                                                    <Badge bg={h.type === 'local' ? 'warning' : 'info'} text="dark">
                                                        {h.type === 'local' ? 'Local' : 'Official'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {h.result && (
                                                        <Badge bg={h.result === 'Win' ? 'success' : h.result === 'Loss' ? 'danger' : 'secondary'}>
                                                            {h.result}
                                                        </Badge>
                                                    )}
                                                    {h.is_man_of_match && <span className="ms-1">⭐</span>}
                                                </td>
                                                <td>
                                                    <small>
                                                        {Object.entries(h.stats || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || '—'}
                                                    </small>
                                                </td>
                                                <td>{h.performance_rating ? `${h.performance_rating}/10` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )
                        )}
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

function Players() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [fitnessFilter, setFitnessFilter] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, beginner: 0, advanced: 0 });

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/players/');
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];
            setPlayers(data);
            setStats({
                total: data.length,
                active: data.filter(p => p.is_active).length,
                beginner: data.filter(p => p.fitness_level === 'BEGINNER').length,
                advanced: data.filter(p => ['ADVANCED', 'PROFESSIONAL'].includes(p.fitness_level)).length,
            });
        } catch (e) {
            console.error('Failed to load players', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = players.filter(p => {
        const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || '';
        const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
            (p.phone || '').includes(search) ||
            (p.city || '').toLowerCase().includes(search.toLowerCase());
        const matchFitness = fitnessFilter === 'ALL' || p.fitness_level === fitnessFilter;
        return matchSearch && matchFitness;
    });

    return (
        <div>
            <h2 className="mb-1 fw-bold text-brand-navy">Players</h2>
            <p className="text-muted mb-4">View all registered players and their profiles</p>

            {/* Stat Cards */}
            <Row className="mb-4">
                {[
                    { label: 'Total Players', value: stats.total, color: '#0A1F35', icon: <FaUsers size={26} /> },
                    { label: 'Active', value: stats.active, color: '#2ECC71', icon: <FaUsers size={26} /> },
                    { label: 'Beginner', value: stats.beginner, color: '#6c757d', icon: <FaMedal size={26} /> },
                    { label: 'Advanced / Pro', value: stats.advanced, color: '#DA6F2B', icon: <FaChartBar size={26} /> },
                ].map((c, i) => (
                    <Col md={3} key={i}>
                        <Card className="shadow-sm border-0 rounded-4 mb-3">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>{c.label}</h6>
                                        <h2 className="mb-0 fw-bold" style={{ color: c.color }}>{c.value}</h2>
                                    </div>
                                    <div className="p-3 bg-light rounded-circle" style={{ color: c.color }}>{c.icon}</div>
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
                        <Col md={6}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><FaSearch className="text-muted" /></span>
                                <Form.Control
                                    placeholder="Search by name, phone, or city..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border-start-0 ps-0"
                                />
                            </div>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={fitnessFilter} onChange={e => setFitnessFilter(e.target.value)}>
                                <option value="ALL">All Fitness Levels</option>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                                <option value="PROFESSIONAL">Professional</option>
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
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>City</th>
                                    <th>Fitness</th>
                                    <th>Matches</th>
                                    <th>Tournaments</th>
                                    <th>Wins</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={10} className="text-center text-muted py-4">No players found</td></tr>
                                ) : filtered.map((p, i) => {
                                    const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || '—';
                                    return (
                                        <tr key={p.id}>
                                            <td className="text-muted">{i + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{
                                                        width: 34, height: 34, borderRadius: 17,
                                                        backgroundColor: '#DA6F2B', color: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: 14, flexShrink: 0,
                                                    }}>
                                                        {(name !== '—' ? name : p.email || 'P').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{name}</div>
                                                        <small className="text-muted">{p.email || p.user_email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{p.phone || '—'}</td>
                                            <td>{p.city || '—'}</td>
                                            <td>
                                                {p.fitness_level ? (
                                                    <Badge style={{ backgroundColor: FITNESS_COLORS[p.fitness_level] }}>
                                                        {p.fitness_level}
                                                    </Badge>
                                                ) : '—'}
                                            </td>
                                            <td className="fw-bold">{p.total_matches ?? 0}</td>
                                            <td className="fw-bold">{p.total_tournaments ?? 0}</td>
                                            <td className="fw-bold text-success">{p.total_wins ?? 0}</td>
                                            <td>
                                                <Badge bg={p.is_active ? 'success' : 'secondary'}>
                                                    {p.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button size="sm" variant="outline-primary" onClick={() => setSelected(p)}>
                                                    <FaEye className="me-1" /> View
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

            {selected && (
                <PlayerDetailModal player={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}

export default Players;
