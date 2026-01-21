import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn } from 'lucide-react';

interface FormData {
  userId: string;
  password: string;
}

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      localStorage.setItem('adminUser', JSON.stringify({
        userId: formData.userId,
        isAdmin: true
      }));

      navigate('/admin-dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-red-800">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-red-900 p-4 rounded-full">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-100 mb-2">
          Admin Portal
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Authorized Personnel Only
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/80 text-red-200 rounded-lg border border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Admin ID
              </div>
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-100 placeholder-gray-500"
              placeholder="Enter admin ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </div>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-100 placeholder-gray-500"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Logging In...' : 'Admin Login'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            <strong>Demo Credentials:</strong><br />
            Admin ID: admin<br />
            Password: admin123
          </p>
        </div>

        <button
          onClick={() => navigate('/register')}
          className="mt-6 w-full text-center text-gray-400 hover:text-gray-300 transition duration-200 text-sm"
        >
          Back to User Login
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
