import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RaiseTicket from './pages/RaiseTicket';
import MyTickets from './pages/MyTickets';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';

// AdminRoute component
function AdminRoute({ children }) {
  const { currentUser, userRole, loading } = useFirebase();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="min-h-screen bg-dark-950">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/raise-ticket" element={
              <Layout>
                <RaiseTicket />
              </Layout>
            } />
            <Route path="/my-tickets" element={
              <Layout>
                <MyTickets />
              </Layout>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <Layout>
                  <AdminPanel />
                </Layout>
              </AdminRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;
