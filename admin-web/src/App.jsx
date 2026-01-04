import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Executives from './pages/Executives';
import Venues from './pages/Venues';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/executives"
          element={
            <PrivateRoute>
              <Layout>
                <Executives />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/venues"
          element={
            <PrivateRoute>
              <Layout>
                <Venues />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;

