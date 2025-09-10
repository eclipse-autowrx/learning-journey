'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaCog, FaList, FaRoute, FaPalette, FaHome } from 'react-icons/fa';
import UserBadge from '@/app/components/atom/UserBadge';
import { useAuth } from '@/lib/frontend/auth';
import CollectionsTab from './components/CollectionsTab';
import PathsTab from './components/PathsTab';
import SettingsTab from './components/SettingsTab';
import ColorThemeTab from './components/ColorThemeTab';
import HomeCfgTab from './components/HomeCfgTab';

function AdminPageInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Get initial tab from URL parameter, default to 'collections'
  const getInitialTab = (): 'collections' | 'paths' | 'settings' | 'theme' | 'home' => {
    const tabParam = searchParams?.get('tab');
    const validTabs = ['collections', 'paths', 'settings', 'theme', 'home'];
    return validTabs.includes(tabParam || '') ? (tabParam as any) : 'collections';
  };
  
  const [activeTab, setActiveTab] = useState<'collections' | 'paths' | 'settings' | 'theme' | 'home'>(getInitialTab);

  const [loading, setLoading] = useState(true);
  const [hasManageUsers, setHasManageUsers] = useState<boolean | null>(null);

  // Function to handle tab changes and update URL
  const handleTabChange = (tab: 'collections' | 'paths' | 'settings' | 'theme' | 'home') => {
    setActiveTab(tab);
    // Update URL with new tab parameter
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Sync tab state with URL parameter changes (for browser back/forward)
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    const validTabs = ['collections', 'paths', 'settings', 'theme', 'home'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary-500)' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>You don't have permission to access the admin panel.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md"
            style={{ 
              backgroundColor: 'var(--color-primary-500)', 
              color: 'var(--text-inverse)'
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b mb-8" style={{ borderColor: 'var(--border-primary)' }}>
             <div className="flex justify-between items-center">
             <div>
                 <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
                 <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                   Manage system settings, collections, and paths
               </p>
             </div>
               <div className="flex items-center space-x-4">
                 <Link
                   href="/"
                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md"
                   style={{
                     backgroundColor: 'var(--color-primary-500)',
                     color: 'var(--text-inverse)'
                   }}
                 >
                   <FaHome className="mr-2" />
                   Home
                 </Link>
                 <UserBadge />
               </div>
         </div>
      </div>

          {/* Tab Navigation */}
          <div className="border-b mb-8" style={{ borderColor: 'var(--border-primary)' }}>
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('collections')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'collections'
                    ? ''
                    : 'border-transparent'
                }`}
                style={{
                  borderBottomColor: activeTab === 'collections' ? 'var(--color-primary-500)' : 'transparent',
                  color: activeTab === 'collections' ? 'var(--color-primary-500)' : 'var(--text-tertiary)'
                }}
              >
                <FaList className="inline-block mr-2" />
                Collections
              </button>
              <button
                onClick={() => handleTabChange('paths')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'paths'
                    ? ''
                    : 'border-transparent'
                }`}
                style={{
                  borderBottomColor: activeTab === 'paths' ? 'var(--color-primary-500)' : 'transparent',
                  color: activeTab === 'paths' ? 'var(--color-primary-500)' : 'var(--text-tertiary)'
                }}
              >
                <FaRoute className="inline-block mr-2" />
                Paths
              </button>
              <button
                onClick={() => handleTabChange('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? ''
                    : 'border-transparent'
                }`}
                style={{
                  borderBottomColor: activeTab === 'settings' ? 'var(--color-primary-500)' : 'transparent',
                  color: activeTab === 'settings' ? 'var(--color-primary-500)' : 'var(--text-tertiary)'
                }}
              >
                <FaCog className="inline-block mr-2" />
                Settings
              </button>
              <button
                onClick={() => handleTabChange('theme')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'theme'
                    ? ''
                    : 'border-transparent'
                }`}
                style={{
                  borderBottomColor: activeTab === 'theme' ? 'var(--color-primary-500)' : 'transparent',
                  color: activeTab === 'theme' ? 'var(--color-primary-500)' : 'var(--text-tertiary)'
                }}
              >
                <FaPalette className="inline-block mr-2" />
                Theme
              </button>
              <button
                onClick={() => handleTabChange('home')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'home'
                    ? ''
                    : 'border-transparent'
                }`}
                style={{
                  borderBottomColor: activeTab === 'home' ? 'var(--color-primary-500)' : 'transparent',
                  color: activeTab === 'home' ? 'var(--color-primary-500)' : 'var(--text-tertiary)'
                }}
              >
                <FaHome className="inline-block mr-2" />
                Home Cfg
              </button>
            </nav>
          </div>

                    {/* Tab Content */}
          <div className="shadow rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
              {activeTab === 'theme' && (
                <ColorThemeTab hasManageUsers={hasManageUsers} />
              )}
              {activeTab === 'home' && (
                <HomeCfgTab hasManageUsers={hasManageUsers} />
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary-500)' }}></div>
      </div>
    }>
      <AdminPageInner />
    </Suspense>
  );
}