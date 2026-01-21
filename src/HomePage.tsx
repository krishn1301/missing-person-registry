import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertTriangle, Search, MapPin, Calendar, X, Ruler, UserCircle2, FileText, Send, MessageSquare, AlertCircle } from 'lucide-react';
import ReportInfoModal from './ReportInfoModal';

interface MissingPerson {
  id: number;
  name: string;
  age: number;
  height?: number;
  lastSeen: string;
  location: string;
  image: string;
}

interface ReportInfo {
  id: number;
  report_id: number;
  info: string;
  submitted_by: string;
  status: string;
  submitted_at: string;
}

interface User {
  userId: string;
  isLoggedIn: boolean;
}

function HomePage() {
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
  const [reports, setReports] = useState<MissingPerson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedPersonInfo, setSelectedPersonInfo] = useState<ReportInfo[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(false);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch approved reports from backend
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reports');
        if (response.ok) {
          const data = await response.json();
          if (data.reports && Array.isArray(data.reports)) {
            setReports(data.reports);
          } else if (Array.isArray(data)) {
            setReports(data);
          }
        } else {
          console.error('Failed to fetch reports:', response.status);
          // Fallback to localStorage
          const storedReports = JSON.parse(localStorage.getItem('missingPersons') || '[]');
          setReports(storedReports);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        // Fallback to localStorage if backend fails
        const storedReports = JSON.parse(localStorage.getItem('missingPersons') || '[]');
        setReports(storedReports);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedPerson) {
      fetchReportInfo(selectedPerson.id);
    }
  }, [selectedPerson]);

  const fetchReportInfo = async (reportId: number) => {
    setLoadingInfo(true);
    try {
      const response = await fetch(`http://localhost:5000/api/report-info/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPersonInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch report info');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    navigate('/register');
  };

  const handleReportInfoClick = () => {
    if (!user?.isLoggedIn) {
      navigate('/register');
    } else {
      setShowInfoModal(true);
    }
  };

  const handleInfoSubmitted = () => {
    if (selectedPerson) {
      fetchReportInfo(selectedPerson.id);
    }
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black relative">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-indigo-400 mr-2" />
                <h1 className="text-2xl font-bold text-white">Missing Persons Registry</h1>
              </div>
              {user?.isLoggedIn && (
                <button
                  onClick={() => navigate('/registration-details')}
                  className="flex items-center gap-2 bg-indigo-600/80 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                  <FileText className="w-4 h-4" />
                  File a Report
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
                    >
                      <UserCircle2 className="w-5 h-5 text-indigo-400" />
                      <span>{user.userId}</span>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-800 py-1 z-50">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 transition duration-200"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Login / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Recent Missing Person Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(report => (
            <div key={report.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-indigo-700 transition duration-200">
              <img
                src={report.image}
                alt={report.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{report.name}</h3>
                <div className="space-y-2 text-gray-300">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Age: {report.age}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Last seen: {report.lastSeen}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {report.location}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedPerson(report)}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Details Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl w-full max-w-4xl overflow-hidden relative my-8">
            <button
              onClick={() => setSelectedPerson(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2">
                <img
                  src={selectedPerson.image}
                  alt={selectedPerson.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2 p-8 flex flex-col">
                <h2 className="text-3xl font-bold text-white mb-6">{selectedPerson.name}</h2>
                <div className="space-y-4 text-gray-300 flex-1">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-sm text-gray-400">Age</p>
                      <p className="text-lg">{selectedPerson.age} years old</p>
                    </div>
                  </div>
                  {selectedPerson.height && (
                    <div className="flex items-center gap-3">
                      <Ruler className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-sm text-gray-400">Height</p>
                        <p className="text-lg">{selectedPerson.height} cm</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-sm text-gray-400">Last Seen</p>
                      <p className="text-lg">{selectedPerson.lastSeen}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-lg">{selectedPerson.location}</p>
                    </div>
                  </div>
                </div>

                {/* Information Updates Section */}
                {selectedPersonInfo.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-lg font-semibold text-white">Information Updates ({selectedPersonInfo.length})</h3>
                    </div>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedPersonInfo.map(info => (
                        <div key={info.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <p className="text-sm text-gray-300">{info.info}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Via {info.submitted_by} • {new Date(info.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-800">
                  <button
                    onClick={handleReportInfoClick}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2 font-semibold"
                  >
                    <Send className="w-5 h-5" />
                    Report Information
                  </button>
                  {!user?.isLoggedIn && (
                    <p className="text-center text-gray-400 text-sm mt-2">
                      Login to submit information
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Info Modal */}
      <ReportInfoModal
        isOpen={showInfoModal}
        reportId={selectedPerson?.id || 0}
        reportName={selectedPerson?.name || ''}
        userId={user?.userId || ''}
        onClose={() => setShowInfoModal(false)}
        onSubmit={handleInfoSubmitted}
      />
    </div>
  );
}

export default HomePage;