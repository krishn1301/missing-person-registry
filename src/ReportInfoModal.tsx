import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

interface ReportInfoModalProps {
  isOpen: boolean;
  reportId: number;
  reportName: string;
  userId: string;
  onClose: () => void;
  onSubmit: () => void;
}

function ReportInfoModal({ isOpen, reportId, reportName, userId, onClose, onSubmit }: ReportInfoModalProps) {
  const [info, setInfo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!info.trim()) {
      setError('Please enter some information');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/report-info/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_id: reportId,
          info: info.trim(),
          submitted_by: userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit information');
      }

      setInfo('');
      onSubmit();
      onClose();
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-800 animate-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Add Information</h2>
            <p className="text-sm text-indigo-200">Case: {reportName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Information or Update
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              value={info}
              onChange={(e) => {
                setInfo(e.target.value);
                setError(null);
              }}
              placeholder="Share any relevant information about this missing person. This could include sightings, tips, or other useful details..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100 placeholder-gray-500 resize-none"
              rows={6}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-2">
              {info.length} characters
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300">
                Your submission will be reviewed by administrators before being published. This helps us maintain the quality and accuracy of information.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit Information'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportInfoModal;
