import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import BrowseRidesPage from './pages/BrowseRidesPage';
import RideDetailsPage from './pages/RideDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Authenticated Pages
import PassengerDashboardPage from './pages/PassengerDashboardPage';
import DriverDashboardPage from './pages/DriverDashboardPage';
import CreateRidePage from './pages/CreateRidePage';
import EditRidePage from './pages/EditRidePage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingRequestsPage from './pages/BookingRequestsPage';
import MyRidesPage from './pages/MyRidesPage';
import VehiclesPage from './pages/VehiclesPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import ReviewsPage from './pages/ReviewsPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRidesPage from './pages/AdminRidesPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminReportsPage from './pages/AdminReportsPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/rides" element={<BrowseRidesPage />} />
        <Route path="/rides/:id" element={<RideDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Global actions accessible from main layout */}
        <Route
          path="/publish-ride"
          element={
            <ProtectedRoute>
              <CreateRidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-ride/:id"
          element={
            <ProtectedRoute>
              <EditRidePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Passenger Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout role="passenger" />
          </ProtectedRoute>
        }
      >
        <Route path="/passenger/dashboard" element={<PassengerDashboardPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
      </Route>

      {/* Driver Hub Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout role="driver" />
          </ProtectedRoute>
        }
      >
        <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
        <Route path="/my-rides" element={<MyRidesPage />} />
        <Route path="/booking-requests" element={<BookingRequestsPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
      </Route>

      {/* Administrator Portal Routes */}
      <Route
        element={
          <AdminRoute>
            <DashboardLayout role="admin" />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/rides" element={<AdminRidesPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
