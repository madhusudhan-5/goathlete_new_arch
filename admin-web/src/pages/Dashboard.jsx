import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaBuilding, FaCalendar, FaChartLine } from 'react-icons/fa';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import analyticsService from '../services/analyticsService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend
);

function Dashboard() {
  const [stats, setStats] = useState({
    totalExecutives: 0,
    activeExecutives: 0,
    preRegisteredVenues: 0,
    registeredVenues: 0,
    meetingsScheduled: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await analyticsService.getDashboardStats();
      setStats({
        totalExecutives: data.totalExecutives || 0,
        activeExecutives: data.activeExecutives || 0,
        preRegisteredVenues: data.preRegisteredVenues || 0,
        registeredVenues: data.registeredVenues || 0,
        meetingsScheduled: data.meetingsScheduled || 0,
        conversionRate: data.conversionRate || 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load analytics. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const conversionData = {
    labels: ['Pre-Registered', 'Registered'],
    datasets: [{
      data: [stats.preRegisteredVenues, stats.registeredVenues],
      backgroundColor: ['#0A1F35', '#DA6F2B'],
      borderWidth: 0,
    }],
  };

  // Build dynamic chart — use real registered vs total ratio per month if available
  // (backend currently returns single snapshot; display as proportion chart)
  const totalVenues = stats.preRegisteredVenues + stats.registeredVenues;
  const regRatio = totalVenues > 0 ? Math.round((stats.registeredVenues / totalVenues) * 100) : 0;
  const execRatio = stats.totalExecutives > 0 ? Math.round((stats.activeExecutives / stats.totalExecutives) * 100) : 0;

  const trendData = {
    labels: ['Executivs Active%', 'Venues Reg%'],
    datasets: [{
      label: 'Conversion Rate (%)',
      data: [execRatio, regRatio],
      borderColor: '#DA6F2B',
      backgroundColor: 'rgba(218, 111, 43, 0.1)',
      tension: 0.4,
    }],
  };

  const executiveData = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [stats.activeExecutives, Math.max(0, stats.totalExecutives - stats.activeExecutives)],
      backgroundColor: ['#DA6F2B', '#0A1F35'],
      borderWidth: 0,
    }],
  };

  const monthlyVenuesData = {
    labels: ['Pre-Registered', 'Registered'],
    datasets: [{
      label: 'Venues',
      data: [stats.preRegisteredVenues, stats.registeredVenues],
      backgroundColor: ['#0A1F35', '#DA6F2B'],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} /></div>;

  return (
    <div>
      <h2 className="mb-1 fw-bold text-brand-navy">Dashboard</h2>
      <p className="text-muted mb-4">Live data from your GoAthlete platform</p>

      {error && (
        <div className="alert alert-warning mb-4">{error}</div>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        {[
          { label: 'Total Executives', value: stats.totalExecutives, sub: `${stats.activeExecutives} active`, icon: <FaUsers size={28} className="text-brand-navy" />, color: '#0A1F35' },
          { label: 'Pre-Registered', value: stats.preRegisteredVenues, sub: 'Pending approval', icon: <FaBuilding size={28} className="text-brand-orange" />, color: '#DA6F2B' },
          { label: 'Registered Venues', value: stats.registeredVenues, sub: 'Live on platform', icon: <FaBuilding size={28} className="text-success" />, color: '#198754' },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, sub: 'Pre-reg → Registered', icon: <FaChartLine size={28} className="text-brand-orange" />, color: '#DA6F2B' },
        ].map((card, i) => (
          <Col md={3} key={i}>
            <Card className="stat-card shadow-sm border-0 rounded-4 mb-3">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted fw-bold mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{card.label}</h6>
                    <h2 className="mb-1 fw-bold" style={{ color: card.color }}>{card.value}</h2>
                    <small className="text-muted fw-bold">{card.sub}</small>
                  </div>
                  <div className="p-3 bg-light rounded-circle">{card.icon}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0 fw-bold text-brand-navy">Platform Activity Ratios</h5>
              <small className="text-muted">Active executives & venue registration percentages</small>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <div className="chart-container">
                <Line data={trendData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0 fw-bold text-brand-navy">Venue Status</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <div className="chart-container">
                <Doughnut data={conversionData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0 fw-bold text-brand-navy">Executive Status</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <div className="chart-container">
                <Doughnut data={executiveData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0 fw-bold text-brand-navy">Venue Registrations</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <div className="chart-container">
                <Bar data={monthlyVenuesData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
