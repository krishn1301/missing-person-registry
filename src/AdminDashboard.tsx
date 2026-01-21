import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, EyeOff, Trash2, Plus, Edit2 } from 'lucide-react';

interface PendingReport {
  id: number;
  name: string;
  age: number;
  location: string;
  image: string;
  phone?: string;
  submitted_at: string;
}

interface ApprovedReport extends PendingReport {
  status: string;
  approved_at: string;
}

interface PendingInfo {
  id: number;
  report_id: number;
  info: string;
  submitted_by: string;
  status: string;
  submitted_at: string;
}

interface ApprovedInfo extends PendingInfo {
  approved_at: string;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending-reports' | 'approved-reports' | 'pending-info'>('pending-reports');
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [approvedReports, setApprovedReports] = useState<ApprovedReport[]>([]);
  const [pendingInfo, setPendingInfo] = useState<PendingInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAddInfoModal, setShowAddInfoModal] = useState(false);
  const [selectedReportForInfo, setSelectedReportForInfo] = useState<ApprovedReport | null>(null);
  const [newInfoText, setNewInfoText] = useState('');
  const adminUser = localStorage.getItem('adminUser');

  useEffect(() => {
    if (!adminUser) {
      navigate('/admin-login');
      return;
    }
    fetchAllData();
  }, [adminUser, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [reportsRes, approvedRes, infoRes] = await Promise.all([
        fetch('http://localhost:5000/api/reports/pending'),
        fetch('http://localhost:5000/api/admin/reports'),
        fetch('http://localhost:5000/api/pending-info')
      ]);

      if (reportsRes.ok) {
        setPendingReports(await reportsRes.json());
      }
      if (approvedRes.ok) {
        setApprovedReports(await approvedRes.json());
      }
      if (infoRes.ok) {
        setPendingInfo(await infoRes.json());
      }
    } catch (err) {
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const approveReport = async (reportId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/approve/${reportId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to approve');

      setPendingReports(pendingReports.filter(r => r.id !== reportId));
      showMessage('success', 'Report approved successfully');
      // Refresh approved reports
      const res = await fetch('http://localhost:5000/api/admin/reports');
      if (res.ok) {
        setApprovedReports(await res.json());
      }
    } catch (err) {
      showMessage('error', 'Failed to approve report');
    }
  };

  const rejectReport = async (reportId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/reject/${reportId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to reject');

      setPendingReports(pendingReports.filter(r => r.id !== reportId));
      showMessage('success', 'Report rejected');
    } catch (err) {
      showMessage('error', 'Failed to reject report');
    }
  };

  const deleteReport = async (reportId: number) => {
    if (!window.confirm('Are you sure you want to delete this report? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports/${reportId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');

      setApprovedReports(approvedReports.filter(r => r.id !== reportId));
      showMessage('success', 'Report deleted successfully');
    } catch (err) {
      showMessage('error', 'Failed to delete report');
    }
  };

  const deleteInfo = async (infoId: number) => {
    if (!window.confirm('Are you sure you want to delete this information?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/report-info/${infoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');

      showMessage('success', 'Information deleted successfully');
    } catch (err) {
      showMessage('error', 'Failed to delete information');
    }
  };

  const approveInfo = async (infoId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/report-info/approve/${infoId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to approve');

      setPendingInfo(pendingInfo.filter(i => i.id !== infoId));
      showMessage('success', 'Information approved successfully');
    } catch (err) {
      showMessage('error', 'Failed to approve information');
    }
  };

  const rejectInfo = async (infoId: number) => {
    try {
      setPendingInfo(pendingInfo.filter(i => i.id !== infoId));
      showMessage('success', 'Information rejected');
    } catch (err) {
      showMessage('error', 'Failed to reject information');
    }
  };

  const addInfoToReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportForInfo || !newInfoText.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/report-info/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_id: selectedReportForInfo.id,
          info: newInfoText.trim(),
          admin_id: JSON.parse(adminUser || '{}').userId
        })
      });

      if (!response.ok) throw new Error('Failed to add info');

      setNewInfoText('');
      setShowAddInfoModal(false);
      setSelectedReportForInfo(null);
      showMessage('success', 'Information added successfully');
    } catch (err) {
      showMessage('error', 'Failed to add information');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };

  const admin = adminUser ? JSON.parse(adminUser) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 to-red-800 border-b border-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-red-200 mt-1">Manage Reports & Information Updates</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-red-100 text-sm">Logged in as</p>
                <p className="text-white font-semibold">{admin?.userId}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-900/90 text-green-100 border border-green-700'
            : 'bg-red-900/90 text-red-100 border border-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending-reports')}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pending-reports'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            Pending Reports ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab('approved-reports')}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'approved-reports'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Approved Reports ({approvedReports.length})
          </button>
          <button
            onClick={() => setActiveTab('pending-info')}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pending-info'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Eye className="w-5 h-5" />
            Pending Info ({pendingInfo.length})
          </button>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="ml-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Pending Reports Tab */}
        {activeTab === 'pending-reports' && (
          <div className="space-y-6">
            {pendingReports.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">No pending reports</p>
              </div>
            ) : (
              pendingReports.map(report => (
                <div
                  key={report.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition duration-200"
                >
                  <div className="md:flex">
                    {report.image && (
                      <div className="md:w-1/4">
                        <img
                          src={report.image}
                          alt={report.name}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <h3 className="text-2xl font-bold text-white mb-4">{report.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-gray-400 text-sm">Age</p>
                          <p className="text-white font-semibold">{report.age} years</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Location</p>
                          <p className="text-white font-semibold">{report.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Submitted</p>
                          <p className="text-white font-semibold text-sm">
                            {new Date(report.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <p className="text-yellow-400 font-semibold">Pending</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-700">
                        <button
                          onClick={() => approveReport(report.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200 font-semibold"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectReport(report.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-200 font-semibold"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approved Reports Tab */}
        {activeTab === 'approved-reports' && (
          <div className="space-y-6">
            {approvedReports.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">No approved reports yet</p>
              </div>
            ) : (
              approvedReports.map(report => (
                <div
                  key={report.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition duration-200"
                >
                  <div className="md:flex">
                    {report.image && (
                      <div className="md:w-1/4">
                        <img
                          src={report.image}
                          alt={report.name}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <h3 className="text-2xl font-bold text-white mb-4">{report.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-gray-400 text-sm">Age</p>
                          <p className="text-white font-semibold">{report.age} years</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Location</p>
                          <p className="text-white font-semibold">{report.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Approved</p>
                          <p className="text-white font-semibold text-sm">
                            {new Date(report.approved_at || '').toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <p className="text-green-400 font-semibold">Live</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-700">
                        <button
                          onClick={() => {
                            setSelectedReportForInfo(report);
                            setShowAddInfoModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200 font-semibold"
                        >
                          <Plus className="w-5 h-5" />
                          Add Info
                        </button>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-200 font-semibold"
                        >
                          <Trash2 className="w-5 h-5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Info Tab */}
        {activeTab === 'pending-info' && (
          <div className="space-y-4">
            {pendingInfo.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">No pending information updates</p>
              </div>
            ) : (
              pendingInfo.map(info => (
                <div
                  key={info.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition duration-200"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-400 text-sm">Submitted by</p>
                        <p className="text-white font-semibold">{info.submitted_by}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Case ID</p>
                        <p className="text-white font-semibold">#{info.report_id}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">
                      {new Date(info.submitted_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
                    <p className="text-gray-200 leading-relaxed">{info.info}</p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => approveInfo(info.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200 font-semibold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectInfo(info.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-200 font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Add Info Modal */}
      {showAddInfoModal && selectedReportForInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-800">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Add Information - {selectedReportForInfo.name}
              </h2>
            </div>

            <form onSubmit={addInfoToReport} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Information to Add
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <textarea
                  value={newInfoText}
                  onChange={(e) => setNewInfoText(e.target.value)}
                  placeholder="Enter new information, updates, or findings about this case..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500 resize-none"
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  {newInfoText.length} characters
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-xs text-gray-300">
                  <strong>Note:</strong> This information will be marked as added by [ADMIN] and will be immediately visible to all users.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddInfoModal(false);
                    setSelectedReportForInfo(null);
                    setNewInfoText('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 font-semibold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
