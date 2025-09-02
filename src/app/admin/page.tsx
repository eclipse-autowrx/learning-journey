'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaCog, FaList, FaRoute } from 'react-icons/fa';
import UserBadge from '@/app/components/atom/UserBadge';
import { useAuth } from '@/lib/frontend/auth';
import CollectionsTab from './components/CollectionsTab';
import PathsTab from './components/PathsTab';
import SettingsTab from './components/SettingsTab';

function AdminPageInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'collections' | 'paths' | 'settings'>('collections');

  const [loading, setLoading] = useState(true);
  const [hasManageUsers, setHasManageUsers] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      checkManageUsersPermission();
    } else if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const checkManageUsersPermission = async () => {
    try {
      const response = await fetch('/api/permissions/has-permission?permissions=manageUsers');

      if (response.ok) {
        const data = await response.json();
        // The API returns an array of booleans, so we take the first one
        setHasManageUsers(Array.isArray(data) ? data[0] : false);
      } else {
        setHasManageUsers(false);
      }
    } catch (error) {
      console.error('Error checking manageUsers permission:', error);
      setHasManageUsers(false);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You don't have permission to access the admin panel.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage system settings, collections, and paths
                </p>
              </div>
              <UserBadge />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('collections')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'collections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaList className="inline-block mr-2" />
                Collections
              </button>
              <button
                onClick={() => setActiveTab('paths')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'paths'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaRoute className="inline-block mr-2" />
                Paths
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCog className="inline-block mr-2" />
                Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {activeTab === 'collections' && (
                <CollectionsTab hasManageUsers={hasManageUsers} />
              )}
              {activeTab === 'paths' && (
                <PathsTab hasManageUsers={hasManageUsers} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab hasManageUsers={hasManageUsers} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AdminPageInner />
    </Suspense>
  );
}