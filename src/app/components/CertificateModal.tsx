// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaSpinner, FaDownload } from 'react-icons/fa';
import Btn from './atom/Btn';

interface CertificateInfo {
  pdfUrl: string;
  pngUrl: string;
  fileName: string;
  generatedAt: string;
  customUserName?: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathId: string;
  pathName: string;
  userId: string;
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
  const [generating, setGenerating] = useState(false);

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
        console.log('Certificate data received:', data.certificate);
        
        // Check if certificate has valid data
        if (!data.certificate || (!data.certificate.pdfUrl && !data.certificate.pngUrl)) {
          console.log('Certificate data is empty or invalid, attempting to generate new certificate');
          setError('Certificate data is invalid. Generating new certificate...');
          // Automatically try to generate a new certificate
          setTimeout(() => {
            generateCertificate();
          }, 1000);
          return;
        }
        
        setCertificate(data.certificate);
      } else {
        console.log('Failed to load certificate, attempting to generate new certificate');
        setError('No certificate found. Generating new certificate...');
        // Automatically try to generate a new certificate
        setTimeout(() => {
          generateCertificate();
        }, 1000);
      }
    } catch (err) {
      console.log('Error loading certificate, attempting to generate new certificate');
      setError('Failed to load certificate. Generating new certificate...');
      // Automatically try to generate a new certificate
      setTimeout(() => {
        generateCertificate();
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    setGenerating(true);
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
        console.log('Generated certificate data:', data.certificate);
        setCertificate(data.certificate);
      } else {
        setError(data.error || 'Failed to generate certificate');
      }
    } catch (err) {
      setError('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[900] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Certificate</h2>
          <div className="flex items-center gap-3">
            {certificate && certificate.pdfUrl && (
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium 
                  text-primary-600 bg-primary-50 border border-primary-200 rounded-md
                   hover:bg-primary-100 transition-colors mr-2"
              >
                <FaDownload />
                Download PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
              <p className="text-lg text-gray-700">Loading certificate...</p>
            </div>
          )}

          {generating && (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
              <p className="text-lg text-gray-700">Generating certificate...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {error && !error.includes('Generating') && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-600 text-center">
                <p className="text-lg font-semibold mb-2">Error</p>
                <p className="text-sm">{error}</p>
                <div className="mt-4 space-x-3">
                  <Btn onClick={fetchCertificate} variant="outlined">
                    Retry
                  </Btn>
                  <Btn onClick={generateCertificate}>
                    Generate New
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {error && error.includes('Generating') && !generating && (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
              <p className="text-lg text-gray-700">{error}</p>
            </div>
          )}

          {certificate && !loading && !generating && (
            <div className="space-y-2">
              {/* Certificate Image */}
              <div className="text-center">
                {certificate.pngUrl ? (
                  <img
                    src={certificate.pngUrl}
                    alt="Certificate"
                    className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm"
                    onError={(e) => {
                      console.error('Failed to load certificate image:', certificate.pngUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Certificate image not available</p>
                    <p className="text-sm text-gray-400 mt-2">PNG URL: {certificate.pngUrl || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Certificate Info */}
              {/* <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Certificate Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Path:</span> {pathName}</p>
                  <p><span className="font-medium">Generated:</span> {certificate.generatedAt ? new Date(certificate.generatedAt).toLocaleDateString() : 'Unknown'}</p>
                  {certificate.customUserName && (
                    <p><span className="font-medium">Custom Name:</span> {certificate.customUserName}</p>
                  )}
                  <p><span className="font-medium">PNG URL:</span> {certificate.pngUrl || 'Not available'}</p>
                  <p><span className="font-medium">PDF URL:</span> {certificate.pdfUrl || 'Not available'}</p>
                </div>
              </div> */}

            </div>
          )}

          {!loading && !generating && !error && !certificate && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-gray-700 mb-4">No certificate found</p>
              <Btn onClick={generateCertificate}>
                Generate Certificate
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}