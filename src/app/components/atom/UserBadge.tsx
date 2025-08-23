'use client';

import React from 'react';
import { useAuth } from '@/lib/frontend/auth';
import { FaUserCircle } from 'react-icons/fa';

interface UserBadgeProps {
  align?: 'left' | 'right';
  variant?: 'default' | 'transparent';
}

export default function UserBadge({ align = 'right', variant = 'default' }: UserBadgeProps) {
  const { isAuthenticated, userName, userId, loading } = useAuth();

  const baseText = variant === 'transparent' ? 'text-white' : 'text-gray-700';
  const subText = variant === 'transparent' ? 'text-white/80' : 'text-gray-500';
  const iconColor = variant === 'transparent' ? 'text-white/90' : 'text-gray-500';
  const containerAlign = align === 'right' ? 'ml-auto' : '';

  if (loading) {
    return <div className={`text-sm ${subText} ${containerAlign}`}>Checking user...</div>;
  }

  if (!isAuthenticated) {
    return <div className={`text-sm ${subText} ${containerAlign}`}>Not signed in</div>;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${baseText} ${containerAlign}`}>
      <FaUserCircle className={`h-5 w-5 ${iconColor}`} />
      <span className="font-medium">{userName || userId}</span>
    </div>
  );
}
