'use client';

import { useState, KeyboardEvent } from 'react';
import { FaTimes } from 'react-icons/fa';

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function TagEditor({ 
  tags, 
  onChange, 
  placeholder = "Type and press Enter to add tags...",
  className = "",
  disabled = false
}: TagEditorProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={`border border-gray-300 rounded-md px-3 py-2 min-h-[38px] flex flex-wrap items-center gap-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className} ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label={`Remove ${tag} tag`}
            >
              <FaTimes className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm placeholder-gray-400"
        />
      )}
    </div>
  );
}
