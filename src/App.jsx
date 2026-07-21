import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminWorkload from './pages/AdminWorkload';
import SuperadminDashboard from './pages/SuperadminDashboard';
import LabRoomManagement from './pages/LabRoomManagement';
import LaboratoryDashboard from './pages/LaboratoryDashboard';
import Students from './pages/Students';
import FacultyManagement from './pages/FacultyManagement';
import StaffManagement from './pages/StaffManagement';
import Dashboard from './pages/Dashboard';
import MasterTimetable from './pages/MasterTimetable';
import SubjectManagement from './pages/SubjectManagement';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/lab-dashboard"
            element={<LaboratoryDashboard />}
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculty"
            element={
              <ProtectedRoute>
                <FacultyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute>
                <StaffManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workload"
            element={
              <ProtectedRoute>
                <AdminWorkload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute>
                <SuperadminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/labs"
            element={
              <ProtectedRoute>
                <LabRoomManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/master-timetable"
            element={
              <ProtectedRoute>
                <MasterTimetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute>
                <SubjectManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router >
  );
}

export default App;
