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
    loading: true,
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const data = await response.json();
          setAuth({
            isAuthenticated: true,
            userId: data.user.id,
            loading: false,
          });
        } else {
          setAuth({
            isAuthenticated: false,
            userId: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuth({
          isAuthenticated: false,
          userId: null,
          loading: false,
        });
      }
    };

    checkUser();
  }, []);

  return auth;
}
