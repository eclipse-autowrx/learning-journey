'use client';

import { useState } from 'react';
import { FaSync, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

interface SystemToolsTabProps {
  hasManageUsers: boolean;
}

interface UpdateResult {
  success: boolean;
  totalChecked: number;
  totalUpdated: number;
  totalErrors: number;
  timestamp: string;
  error?: string;
}

export default function SystemToolsTab({ hasManageUsers }: SystemToolsTabProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateResult, setLastUpdateResult] = useState<UpdateResult | null>(null);

  const handleUpdatePathProgress = async () => {
    if (!hasManageUsers) {
      alert('You do not have permission to perform this action.');
      return;
    }

    setIsUpdating(true);
    setLastUpdateResult(null);

    try {
      const response = await fetch('/api/admin/update-path-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setLastUpdateResult({
          success: true,
          totalChecked: result.data.totalChecked,
          totalUpdated: result.data.totalUpdated,
          totalErrors: result.data.totalErrors,
          timestamp: result.data.timestamp
        });
      } else {
        setLastUpdateResult({
          success: false,
          totalChecked: 0,
          totalUpdated: 0,
          totalErrors: 0,
          timestamp: new Date().toISOString(),
          error: result.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Error updating path progress:', error);
      setLastUpdateResult({
        success: false,
        totalChecked: 0,
        totalUpdated: 0,
        totalErrors: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network error occurred'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!hasManageUsers) {
    return (
      <div className="text-center py-8">
        <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">You do not have permission to access system tools.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Tools</h2>
        <p className="text-gray-600">
          Administrative tools for maintaining and updating the learning journey system.
        </p>
      </div>

      {/* Path Progress Update Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FaSync className="mr-2" />
              Path Progress Update
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Recalculate and update all path progress based on current course completion data.
              This ensures certification counts are accurate across all learning paths.
            </p>
          </div>
          <button
            onClick={handleUpdatePathProgress}
            disabled={isUpdating}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isUpdating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isUpdating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <FaSync className="mr-2" />
                Update Path Progress
              </>
            )}
          </button>
        </div>

        {/* Last Update Result */}
        {lastUpdateResult && (
          <div className={`mt-4 p-4 rounded-md ${
            lastUpdateResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              {lastUpdateResult.success ? (
                <FaCheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
              ) : (
                <FaExclamationTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              )}
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  lastUpdateResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastUpdateResult.success ? 'Update Completed Successfully' : 'Update Failed'}
                </h4>
                <div className="mt-2 text-sm">
                  {lastUpdateResult.success ? (
                    <div className="space-y-1">
                      <p className="text-green-700">
                        <strong>Users Checked:</strong> {lastUpdateResult.totalChecked}
                      </p>
                      <p className="text-green-700">
                        <strong>Users Updated:</strong> {lastUpdateResult.totalUpdated}
                      </p>
                      <p className="text-green-700">
                        <strong>Errors:</strong> {lastUpdateResult.totalErrors}
                      </p>
                      <p className="text-green-700">
                        <strong>Completed:</strong> {new Date(lastUpdateResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-700">
                      <strong>Error:</strong> {lastUpdateResult.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">When to use this tool</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>After bulk course or lesson updates</li>
                  <li>When certification counts appear incorrect</li>
                  <li>After data migration or import operations</li>
                  <li>As part of regular system maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional System Tools can be added here */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Tools</h3>
        <p className="text-sm text-gray-500">
          More system maintenance tools will be added here as needed.
        </p>
      </div>
    </div>
  );
}
