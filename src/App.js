import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseProvider } from './contexts/FirebaseContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RaiseTicket from './pages/RaiseTicket';
import MyTickets from './pages/MyTickets';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';

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
              <Layout>
                <AdminPanel />
              </Layout>
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
