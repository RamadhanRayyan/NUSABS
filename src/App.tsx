/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardRedirect from "./pages/DashboardRedirect";
import WaitingPage from "./pages/WaitingPage";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ClassManagement from "./pages/admin/ClassManagement";
import StudentTracking from "./pages/admin/StudentTracking";
import TeacherTracking from "./pages/admin/TeacherTracking";
import AttendanceTracking from "./pages/admin/AttendanceTracking";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherExamScores from "./pages/teacher/TeacherExamScores";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssignments from "./pages/student/StudentAssignments";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors theme="dark" />
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Redirect after login */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/waiting" element={<ProtectedRoute><WaitingPage /></ProtectedRoute>} />

          {/* ── ADMIN ROUTES ── */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><UserManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><ClassManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><StudentTracking /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/teachers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><TeacherTracking /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><AttendanceTracking /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ── TEACHER ROUTES ── */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout><TeacherDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/assignments" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout><TeacherAssignments /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/attendance" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout><TeacherAttendance /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/scores" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout><TeacherExamScores /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ── STUDENT ROUTES ── */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><StudentDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/assignments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><StudentAssignments /></DashboardLayout>
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

export default App;
