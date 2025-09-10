'use client';

import React, { useState } from 'react';
import { FaCertificate, FaSpinner } from 'react-icons/fa';
import CertificateModal from './CertificateModal';

interface PathCompletionButtonProps {
  pathId: string;
  pathName: string;
  userId: string;
  isCompleted: boolean;
  onComplete?: () => void;
}

export default function PathCompletionButton({ 
  pathId, 
  pathName, 
  userId, 
  isCompleted,
  onComplete 
}: PathCompletionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompletePath = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/certificates/complete-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pathId,
          pathName
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Call the completion callback if provided
        if (onComplete) {
          onComplete();
        }
        
        // Show success message or redirect
      } else {
        setError(data.error || 'Failed to complete path');
      }
    } catch (err) {
      setError('Failed to complete path');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = () => {
    setShowCertificate(true);
  };

  if (isCompleted) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600">
          <FaCertificate className="w-5 h-5" />
          <span className="font-medium">Path Completed!</span>
        </div>
        
        <button
          onClick={handleViewCertificate}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <FaCertificate className="w-4 h-4" />
          View Certificate
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          pathId={pathId}
          pathName={pathName}
          userId={userId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCompletePath}
        disabled={loading}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <FaSpinner className="w-4 h-4 animate-spin" />
        ) : (
          <FaCertificate className="w-4 h-4" />
        )}
        {loading ? 'Completing Path...' : 'Complete Path & Generate Certificate'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}