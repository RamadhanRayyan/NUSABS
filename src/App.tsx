/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardRedirect from "./pages/DashboardRedirect";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><PlaceholderPage title="User Management" /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><PlaceholderPage title="Class Management" /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout><TeacherDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout><PlaceholderPage title="My Classes" /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/assignments" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout><PlaceholderPage title="Assignments" /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><StudentDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/assignments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><PlaceholderPage title="My Assignments" /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/projects" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><PlaceholderPage title="My Projects" /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/portfolio" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><PlaceholderPage title="Portfolio" /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><PlaceholderPage title="Attendance" /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground max-w-md">
        This feature is part of the NUSA Boarding School SaaS system and is currently under development.
      </p>
    </div>
  );
}

export default App;

