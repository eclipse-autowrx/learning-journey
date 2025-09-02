'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/frontend/auth';
import { FaUserCircle, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

interface UserBadgeProps {
  align?: 'left' | 'right';
  variant?: 'default' | 'transparent';
}

export default function UserBadge({ align = 'right', variant = 'default' }: UserBadgeProps) {
  const { isAuthenticated, userName, userId, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const baseText = variant === 'transparent' ? 'text-white' : 'text-neutral-700';
  const subText = variant === 'transparent' ? 'text-white/80' : 'text-neutral-500';
  const iconColor = variant === 'transparent' ? 'text-white/90' : 'text-neutral-500';
  const containerAlign = align === 'right' ? 'ml-auto' : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  if (loading) {
    return <div className={`text-sm ${subText} ${containerAlign}`}>Checking user...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className={`${containerAlign}`}>
        <button
          onClick={() => {
            // You can customize this to redirect to your login page or open a login modal
            window.location.href = '/login'; // or handle login logic here
          }}
          className={`flex items-center gap-2 px-2 text-sm font-medium rounded-md transition-colors ${
            variant === 'transparent' 
              ? 'text-white hover:text-white/50 cursor-pointer' 
              : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'
          }`}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${containerAlign}`} ref={dropdownRef}>
      <div 
        className={`flex items-center gap-2 text-sm ${baseText} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <FaUserCircle className={`h-5 w-5 ${iconColor}`} />
        <span className="font-medium">{userName || userId}</span>
      </div>

      {isDropdownOpen && (
        <div className={`absolute top-full mt-1 ${align === 'right' ? 'right-0' : 'left-0'} z-50 min-w-[120px] bg-white border border-neutral-200 rounded-md shadow-lg`}>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2 transition-colors"
          >
            <FaSignOutAlt className="h-4 w-4" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
