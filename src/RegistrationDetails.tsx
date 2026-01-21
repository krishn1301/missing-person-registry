import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserPlus, MapPin, Calendar, Ruler, Camera, AlertCircle } from 'lucide-react';

interface RegistrationDetailsForm {
  personName: string;
  age: string;
  height: string;
  lastSeen: string;
  place: string;
  photo: File | null;
}

function RegistrationDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [formData, setFormData] = useState<RegistrationDetailsForm>({
    personName: '',
    age: '',
    height: '',
    lastSeen: '',
    place: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get current user
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        throw new Error('Please login first');
      }
      const user = JSON.parse(userData);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('personName', formData.personName);
      submitData.append('age', formData.age);
      submitData.append('height', formData.height);
      submitData.append('lastSeen', formData.lastSeen);
      submitData.append('place', formData.place);
      submitData.append('submitted_by', user.userId);
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }

      // Send to backend
      const response = await fetch('http://localhost:5000/api/reports/submit', {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/home');
      }, 2000);
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-indigo-900 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-100 mb-8">
          Enter Missing Person Details
        </h1>

        {success && (
          <div className="mb-6 p-4 bg-green-900/80 text-green-200 rounded-lg border border-green-700">
            Report submitted successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/80 text-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Person Name
            </label>
            <input
              type="text"
              name="personName"
              value={formData.personName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Height (cm)
              </div>
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last Seen
              </div>
            </label>
            <input
              type="date"
              name="lastSeen"
              value={formData.lastSeen}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Place
              </div>
            </label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo
              </div>
            </label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
              required
            />
            {photoPreview && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'Submitting...' : 'Enter Missing Person Details'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistrationDetails;