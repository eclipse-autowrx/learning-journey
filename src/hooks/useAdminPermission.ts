'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/frontend/auth';

export function useAdminPermission() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      checkAdminPermission();
    } else if (!authLoading && !isAuthenticated) {
      setHasAdminAccess(false);
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const checkAdminPermission = async () => {
    try {
      const response = await fetch('/api/permissions/has-permission?permissions=manageUsers');
      
      if (response.ok) {
        const data = await response.json();
        // The API returns an array of booleans, so we take the first one
        setHasAdminAccess(Array.isArray(data) ? data[0] : false);
      } else {
        setHasAdminAccess(false);
      }
    } catch (error) {
      console.error('Error checking admin permission:', error);
      setHasAdminAccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { hasAdminAccess, loading };
}