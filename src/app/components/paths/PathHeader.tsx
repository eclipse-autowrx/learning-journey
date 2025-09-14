// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { FaCog } from 'react-icons/fa';
import ManageBreadCrumb from '@/app/components/atom/ManageBreadCrumb';
import UserBadge from '@/app/components/atom/UserBadge';
import DropdownMenu, { DropdownItem } from '@/app/components/atom/DropdownMenu';
import { PATH_STATES } from '@/lib/const';

interface Path {
  _id: string;
  name: string;
  slug: string;
  state: string;
}

interface PathHeaderProps {
  path: Path;
  pathState: string;
  onStateChange: (newState: string) => Promise<void>;
}

export default function PathHeader({ path, pathState, onStateChange }: PathHeaderProps) {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'published':
        return 'bg-secondary-100 text-secondary-800';
      case 'reviewing':
        return 'bg-accent-100 text-accent-800';
      case 'draft':
        return 'bg-primary-100 text-primary-800';
      case 'archived':
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <>
      <ManageBreadCrumb items={[
        { label: 'Paths', link: '/manage?tab=paths' },
        { label: path.name }
      ]} rightSlot={<UserBadge align="right" variant="transparent" />} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">{path.name}</h1>
                <p className="mt-1 text-sm text-neutral-500">
                  {path.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-neutral-500">State:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(pathState)}`}>
                  {pathState}
                </span>
                <DropdownMenu
                  items={PATH_STATES.filter(s => s.value !== 'published').map((s) => ({ 
                    label: s.label, 
                    onClick: async () => { await onStateChange(s.value); } 
                  })) as DropdownItem[]}
                  trigger={<span>Change State</span>}
                  buttonAriaLabel="Change state"
                  align="left"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
