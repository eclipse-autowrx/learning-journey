'use client';

import { FaCog } from "react-icons/fa";
import Link from 'next/link';
import { useAdminPermission } from '@/hooks/useAdminPermission';
import UserBadge from './atom/UserBadge';

export default function TopRightControls() {
  const { hasAdminAccess, loading } = useAdminPermission();

  return (
    <div className="absolute top-0 right-2 z-[100] flex items-center gap-3">
      {/* Admin Link - only show if user has admin access */}
      {!loading && hasAdminAccess && (
        <Link 
          href="/admin"
          className="flex items-center gap-1 text-white text-sm font-medium py-1 hover:text-white/70 transition-colors"
        >
          <FaCog className="h-4 w-4" />
          Admin
        </Link>
      )}
      
      {/* UserBadge */}
      <UserBadge align="right" variant="transparent" />
    </div>
  );
}