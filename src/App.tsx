import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserPlus, Lock, User, UserCircle2, LogIn } from 'lucide-react';
import RegistrationDetails from './RegistrationDetails';
import HomePage from './HomePage';
import Registration from './Registration';
import SignUp from './SignUp';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/registration-details" element={<RegistrationDetails />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;