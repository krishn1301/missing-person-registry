import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Lock, User, UserCircle2, LogIn } from 'lucide-react';

interface FormData {
  userId: string;
  password: string;
}

interface CaseData {
  name: string;
  age: number;
  location: string;
  image: string;
}

const scrollingCases: CaseData[] = [
  {
    name: "John Doe",
    age: 25,
    location: "New York",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800"
  },
  {
    name: "Jane Smith",
    age: 32,
    location: "Los Angeles",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"
  },
  {
    name: "Michael Johnson",
    age: 45,
    location: "Chicago",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
  },
  {
    name: "Sarah Wilson",
    age: 28,
    location: "Miami",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800"
  }
];

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    password: ''
  });
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCaseIndex((prevIndex) => 
        prevIndex === scrollingCases.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Try admin login first
      const adminResponse = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        localStorage.setItem('adminUser', JSON.stringify({
          userId: formData.userId,
          isAdmin: true
        }));
        navigate('/admin-dashboard');
        return;
      }

      // If not admin, try user login
      const userResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.error || 'Login failed');
      }

      localStorage.setItem('currentUser', JSON.stringify({
        userId: formData.userId,
        isLoggedIn: true
      }));

      navigate('/home');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleGuestLogin = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {scrollingCases.map((caseData, index) => (
            <div
              key={index}
              className={`absolute w-full h-full transition-opacity duration-1000 ${
                index === currentCaseIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={caseData.image}
                alt={caseData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <p className="text-white text-xl">{caseData.name}</p>
                <p className="text-gray-300">Age: {caseData.age} | Last seen in {caseData.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-800">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-indigo-900/80 p-3 rounded-full">
              <LogIn className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-100 mb-8">
            Log In
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-900/80 text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User ID
                </div>
              </label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800/90 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                placeholder="Enter your user ID"
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
                className="w-full px-4 py-2 bg-gray-800/90 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600/90 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <button
            onClick={() => navigate('/signup')}
            className="mt-4 w-full text-indigo-400 hover:text-indigo-300 transition duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Create an Account
          </button>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="mt-6 w-full bg-gray-800/90 text-gray-300 py-2 px-4 rounded-lg border border-gray-700 hover:bg-gray-700 transition duration-200 flex items-center justify-center gap-2"
          >
            <UserCircle2 className="w-5 h-5" />
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registration;