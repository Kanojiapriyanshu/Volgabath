import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaintDetail from './pages/AdminComplaintDetail';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/complaints/:id"
        element={
          <PrivateRoute>
            <AdminComplaintDetail />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
