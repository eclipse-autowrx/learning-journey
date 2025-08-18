'use client';

import React, { useState } from 'react';
import { FaRoute, FaGraduationCap, FaBook, FaEllipsisV, FaTrash, FaChevronRight, FaChevronDown } from 'react-icons/fa';

const ICONS = {
  path: <FaRoute className="text-blue-500" />,
  course: <FaGraduationCap className="text-green-500" />,
  lesson: <FaBook className="text-purple-500" />,
};

const TreeItem = ({ item, type, onSelect, onDelete, selectedItem }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hasChildren = (item.courses && item.courses.length > 0) || (item.lessons && item.lessons.length > 0);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(item, type);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item, type);
    setIsDropdownOpen(false);
  }

  const isSelected = selectedItem?.item?._id === item._id && selectedItem?.type === type;

  return (
    <div className="my-1">
      <div 
        className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-200 ${isSelected ? 'bg-blue-100' : 'bg-white'}`}
        onClick={handleSelect}
      >
        <div className="flex items-center w-full">
          <div className="w-6 min-w-6 max-w-6">
            {hasChildren && (
              <button onClick={(e) => { e.stopPropagation(); handleToggleExpand(); }} 
                className="p-1 rounded-full hover:bg-gray-300">
                {isExpanded ? <FaChevronDown size="12" /> : <FaChevronRight size="12" />}
              </button>
            )}
          </div>
          <div className="mr-2 w-6 max-w-6">{ICONS[type]}</div>
          <span className="text-sm grow text-left">{item.name}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
            className="p-1 rounded-full hover:bg-gray-300"
          >
            <FaEllipsisV size="14" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200">
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <FaTrash className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-6 pl-2 border-l-2 border-gray-200">
          {item.courses?.map(course => (
            <TreeItem 
              key={course._id} 
              item={course} 
              type="course" 
              onSelect={onSelect} 
              onDelete={onDelete} 
              selectedItem={selectedItem} 
            />
          ))}
          {item.lessons?.map(lesson => (
            <TreeItem 
              key={lesson._id} 
              item={lesson} 
              type="lesson" 
              onSelect={onSelect} 
              onDelete={onDelete} 
              selectedItem={selectedItem} 
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default function ImportTreeView({ data, onSelect, onDelete, selectedItem }) {
  if (!data || !data.paths) {
    return <p className="text-gray-500">No data to display.</p>;
  }

  return (
    <div>
      {data.paths.map(path => (
        <TreeItem 
          key={path._id} 
          item={path} 
          type="path" 
          onSelect={onSelect} 
          onDelete={onDelete} 
          selectedItem={selectedItem} 
        />
      ))}
    </div>
  );
}
