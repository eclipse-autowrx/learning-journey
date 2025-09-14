// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { FaCog, FaList, FaThLarge } from 'react-icons/fa';

type TabType = 'info' | 'courses' | 'canvas';

interface PathTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  coursesCount: number;
}

export default function PathTabs({ activeTab, onTabChange, coursesCount }: PathTabsProps) {
  const tabs = [
    {
      id: 'info' as TabType,
      label: 'Path Information',
      icon: FaCog,
    },
    {
      id: 'courses' as TabType,
      label: `Courses (${coursesCount})`,
      icon: FaList,
    },
    {
      id: 'canvas' as TabType,
      label: 'Canvas',
      icon: FaThLarge,
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Icon className="inline mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
