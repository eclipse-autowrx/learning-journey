'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaEllipsisV } from 'react-icons/fa';

type Align = 'left' | 'right';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
  align?: Align;
  className?: string;
  menuClassName?: string;
  buttonAriaLabel?: string;
}

export default function DropdownMenu({
  items,
  trigger,
  align = 'left',
  className,
  menuClassName,
  buttonAriaLabel = 'Actions',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative dropdown-container ${className || ''}`}>
      <button
        type="button"
        aria-label={buttonAriaLabel}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center px-2 py-1 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50"
      >
        {trigger ?? <FaEllipsisV className="h-4 w-4" />}
      </button>
      {open && (
        <div
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-md shadow-lg z-[9999] border border-neutral-200 ${menuClassName || ''}`}
        >
          <div className="py-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  try { item.onClick(); } finally { setOpen(false); }
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 ${item.danger ? 'text-red-600' : 'text-neutral-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
