import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardLayout from './components/layout/DashboardLayout';
import { authService } from './services/auth';
import VenuesList from './pages/venues/VenuesList';
import VenueForm from './pages/venues/VenueForm';
import CourtsList from './pages/venues/CourtsList';
import SlotRules from './pages/venues/SlotRules';
import BookingCalendar from './pages/bookings/BookingCalendar';
import BookingsManage from './pages/bookings/BookingsManage';
import PartnerRequests from './pages/admin/PartnerRequests';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="venues" element={<VenuesList />} />
          <Route path="venues/new" element={<VenueForm />} />
          <Route path="venues/:id/courts" element={<CourtsList />} />
          <Route path="venues/:id/slots" element={<SlotRules />} />
          <Route path="bookings" element={<BookingCalendar />} />
          <Route path="bookings/manage" element={<BookingsManage />} />
          <Route path="users" element={<div>Users Management (Coming Soon)</div>} />
          <Route path="requests" element={<PartnerRequests />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
