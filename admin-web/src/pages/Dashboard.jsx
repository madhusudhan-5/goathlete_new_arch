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
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demonstration
      // In production, replace with actual API calls
      setStats({
        totalExecutives: 45,
        activeExecutives: 38,
        preRegisteredVenues: 127,
        registeredVenues: 89,
        meetingsScheduled: 234,
        conversionRate: 70,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const conversionData = {
    labels: ['Pre-Registered', 'Registered'],
    datasets: [
      {
        data: [stats.preRegisteredVenues, stats.registeredVenues],
        backgroundColor: ['#ffc107', '#28a745'],
        borderWidth: 0,
      },
    ],
  };

  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Registered Venues',
        data: [12, 19, 25, 38, 55, 89],
        borderColor: '#DA6F2B',
        backgroundColor: 'rgba(218, 111, 43, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Meetings',
        data: [25, 45, 68, 102, 156, 234],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const executiveData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [stats.activeExecutives, stats.totalExecutives - stats.activeExecutives],
        backgroundColor: ['#28a745', '#dc3545'],
        borderWidth: 0,
      },
    ],
  };

  const monthlyVenuesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Venues',
        data: [8, 12, 15, 22, 28, 34],
        backgroundColor: '#DA6F2B',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Executives</h6>
                  <h2 className="mb-0">{stats.totalExecutives}</h2>
                  <small className="text-success">
                    {stats.activeExecutives} active
                  </small>
                </div>
                <FaUsers size={40} className="text-brand-orange opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Pre-Registered</h6>
                  <h2 className="mb-0">{stats.preRegisteredVenues}</h2>
                  <small className="text-warning">Pending approval</small>
                </div>
                <FaBuilding size={40} className="text-warning opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Meetings Scheduled</h6>
                  <h2 className="mb-0">{stats.meetingsScheduled}</h2>
                  <small className="text-info">This month</small>
                </div>
                <FaCalendar size={40} className="text-info opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Conversion Rate</h6>
                  <h2 className="mb-0">{stats.conversionRate}%</h2>
                  <small className="text-success">Pre-reg to Reg</small>
                </div>
                <FaChartLine size={40} className="text-success opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Growth Trends</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Line data={trendData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Venue Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut data={conversionData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Executive Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut data={executiveData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Monthly Venue Registrations</h5>
            </Card.Header>
            <Card.Body>
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

