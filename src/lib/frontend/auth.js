// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useEffect, useState } from 'react';

export function useAuth() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    userId: null,
    userName: null,
    loading: true,
  });

  const logout = async () => {
    try {
      // Call logout API to properly clear HttpOnly cookies
      const response = await fetch('/api/user/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update auth state to logged out
        setAuth({
          isAuthenticated: false,
          userId: null,
          userName: null,
          loading: false,
        });
      } else {
        console.error('Logout API failed:', response.statusText);
        // Still update the local state even if API call fails
        setAuth({
          isAuthenticated: false,
          userId: null,
          userName: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still update the local state even if API call fails
      setAuth({
        isAuthenticated: false,
        userId: null,
        userName: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const data = await response.json();
          setAuth({
            isAuthenticated: true,
            userId: data.user.id,
            userName: data.user.name || null,
            loading: false,
          });
        } else {
          setAuth({
            isAuthenticated: false,
            userId: null,
            userName: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuth({
          isAuthenticated: false,
          userId: null,
          userName: null,
          loading: false,
        });
      }
    };

    checkUser();
  }, []);

  return { ...auth, logout };
}
