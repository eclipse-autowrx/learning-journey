'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaRegEdit, FaSpinner } from 'react-icons/fa';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathId: string;
  pathName: string;
  userId: string;
}

interface CertificateInfo {
  pdfUrl: string;
  pngUrl: string;
  fileName: string;
  generatedAt: string;
  customUserName?: string;
}

export default function CertificateModal({ 
  isOpen, 
  onClose, 
  pathId, 
  pathName, 
  userId 
}: CertificateModalProps) {
  const [certificate, setCertificate] = useState<CertificateInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (isOpen && pathId) {
      fetchCertificate();
    }
  }, [isOpen, pathId]);

  const fetchCertificate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/certificates/get?pathId=${pathId}`);
      const data = await response.json();
      
      if (data.success) {
        setCertificate(data.certificate);
        setCustomName(data.certificate.customUserName || '');
      } else {
        setError(data.error || 'Failed to load certificate');
      }
    } catch (err) {
      setError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!customName.trim()) {
      setError('Please enter a custom name');
      return;
    }

    setRegenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/certificates/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pathId,
          pathName,
          customUserName: customName.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCertificate(data.certificate);
        setIsEditing(false);
        setError(null);
      } else {
        setError(data.error || 'Failed to regenerate certificate');
      }
    } catch (err) {
      setError('Failed to regenerate certificate');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = () => {
    if (certificate?.pdfUrl) {
      const link = document.createElement('a');
      link.href = certificate.pdfUrl;
      link.download = `${certificate.fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Certificate of Completion</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin w-8 h-8 text-blue-600" />
              <span className="ml-2 text-gray-600">Loading certificate...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {certificate && !loading && (
            <div className="space-y-6">
              {/* Certificate Image */}
              <div className="text-center">
                <img
                  src={certificate.pngUrl}
                  alt="Certificate"
                  className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm"
                />
              </div>

              {/* Certificate Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Certificate Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Path:</span> {pathName}</p>
                  <p><span className="font-medium">Generated:</span> {new Date(certificate.generatedAt).toLocaleDateString()}</p>
                  {certificate.customUserName && (
                    <p><span className="font-medium">Custom Name:</span> {certificate.customUserName}</p>
                  )}
                </div>
              </div>

              {/* Custom Name Editor */}
              {isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Edit Certificate Name</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Enter your preferred name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {regenerating ? (
                          <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                        ) : (
                          <FaRegEdit className="w-4 h-4 mr-2" />
                        )}
                        {regenerating ? 'Regenerating...' : 'Regenerate Certificate'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaRegEdit className="w-4 h-4 mr-2" />
                  Edit Name
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}