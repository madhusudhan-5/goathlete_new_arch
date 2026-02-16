import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardLayout from './components/layout/DashboardLayout';
import CourtsList from './pages/courts/CourtsList';
import CreateBooking from './pages/bookings/CreateBooking';
import BlockSlot from './pages/slots/BlockSlot';
import { authService } from './services/api';

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
          <Route path="courts" element={<CourtsList />} />
          <Route path="bookings/create" element={<CreateBooking />} />
          <Route path="slots/block" element={<BlockSlot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
