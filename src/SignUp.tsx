import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Phone, User, Lock, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const signUpSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  userId: z.string().min(3, 'User ID must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpForm>({
    phone: '',
    userId: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      // Validate form data
      signUpSchema.parse(formData);

      // Sign up with Flask backend API
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      // Store user info and redirect
      localStorage.setItem('user_id', formData.userId);
      navigate('/register');
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-indigo-900 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-100 mb-8">
          Create an Account
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
                <Phone className="w-4 h-4" />
                Phone Number
              </div>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
              placeholder="Enter your phone number"
              required
            />
          </div>

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
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
              placeholder="Choose a user ID"
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </div>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                placeholder="Re-enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => navigate('/register')}
          className="mt-6 w-full text-center text-indigo-400 hover:text-indigo-300 transition duration-200"
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
}

export default SignUp;