// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useRef, useEffect } from 'react';
import { FaGraduationCap, FaTrash, FaSave, FaImage, FaRegStickyNote, FaCode, FaEye } from 'react-icons/fa';
import { showToast, showDeleteConfirm } from '@/lib/utils/notifications';
import ImageEditor from '@/app/components/atom/ImageEditor';
import MarkdownRender from '@/app/components/atom/MarkdownRender';
import Editor from '@monaco-editor/react';

interface Course {
  _id: string;
  name: string;
  slug: string;
}

interface MapItem {
  course_id?: string; // Optional for course items
  certificate_id?: string; // Optional for certificate items
  type?: string; // Node type: 'course', 'certificate', 'text_markdown', 'icon'
  x: string;
  y: string;
  // For text_markdown nodes
  markdown_content?: string;
  background_color?: string;
  // For icon nodes
  width?: string;
  height?: string;
  hover_content?: string;
  icon_url?: string;
  link_url?: string;
  popup_markdown_content?: string;
}

interface Path {
  background_img?: string;
  maps: MapItem[];
  courses: Course[];
}

interface PathCanvasEditorProps {
  path: Path;
  onSave: (maps: MapItem[]) => void;
  onBackgroundImageUpdate: (url: string) => void;
}

const PathCanvasEditor = ({ path, onSave, onBackgroundImageUpdate }: PathCanvasEditorProps) => {
  const [maps, setMaps] = useState<MapItem[]>(path.maps || []);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showMarkdownForm, setShowMarkdownForm] = useState(false);
  const [showIconForm, setShowIconForm] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('# New Markdown\n\nAdd your content here.');
  const [markdownBackground, setMarkdownBackground] = useState('transparent');
  const [markdownWidth, setMarkdownWidth] = useState('200px');
  const [markdownHeight, setMarkdownHeight] = useState('auto');
  const [editingMarkdownNode, setEditingMarkdownNode] = useState<MapItem | null>(null);
  const [iconUrl, setIconUrl] = useState('/icons/info.png');
  const [iconHoverText, setIconHoverText] = useState('');
  const [iconWidth, setIconWidth] = useState('40px');
  const [iconHeight, setIconHeight] = useState('40px');
  const [iconLinkUrl, setIconLinkUrl] = useState('');
  const [iconPopupMarkdown, setIconPopupMarkdown] = useState('');
  const [actionType, setActionType] = useState<'link' | 'popup' | ''>('');
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  // JSON Editor functions
  const switchToJsonMode = () => {
    setJsonContent(JSON.stringify(maps, null, 2));
    setIsJsonMode(true);
  };

  // Update JSON content when maps change
  useEffect(() => {
    if (!isJsonMode) {
      setJsonContent(JSON.stringify(maps, null, 2));
    }
  }, [maps, isJsonMode]);

  const switchToVisualMode = () => {
    setIsJsonMode(false);
  };

  const handleJsonSave = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed)) {
        // Validate that each item has required properties
        const isValid = parsed.every(item =>
          item &&
          typeof item === 'object' &&
          typeof item.x === 'string' &&
          typeof item.y === 'string' &&
          (item.course_id || item.certificate_id || item.type)
        );

        if (isValid) {
          setMaps(parsed);
          setIsJsonMode(false);
          showToast.success('JSON saved successfully!');
        } else {
          showToast.error('Invalid JSON: Each item must have x, y coordinates and a valid node type (course_id, certificate_id, or type)');
        }
      } else {
        showToast.error('Invalid JSON: Must be an array of map items');
      }
    } catch (error) {
      showToast.error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleJsonChange = (value: string | undefined) => {
    if (value !== undefined) {
      setJsonContent(value);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      showToast.success('JSON formatted successfully!');
    } catch (error) {
      showToast.error('Invalid JSON format');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/medias/upload_image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onBackgroundImageUpdate(result.url);
        showToast.success('Background image uploaded successfully.');
      } else {
        showToast.error('Failed to upload image.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast.error('An error occurred while uploading the image.');
    }
  };



  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const courseId = e.dataTransfer.getData('courseId');
    const certificateId = e.dataTransfer.getData('certificateId');
    const nodeType = e.dataTransfer.getData('nodeType');
    const nodeData = e.dataTransfer.getData('nodeData');

    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Adjust for the offset within the node where the user clicked
      let adjustedClientX = e.clientX;
      let adjustedClientY = e.clientY;

      // For existing nodes being repositioned, use the drag offset
      // For new nodes from sidebar, center them at the drop location
      if (dragOffset && nodeData) {
        // Existing node: subtract the offset so the same relative point within the node
        // ends up at the drop location
        adjustedClientX -= dragOffset.x;
        adjustedClientY -= dragOffset.y;
      } else if (!nodeData) {
        // New node from sidebar: center it at the drop location
        let nodeWidth = 11; // vw (default for courses/certificates)
        let nodeHeight = 11; // vw

        // Adjust dimensions based on node type
        if (nodeType === 'text_markdown') {
          nodeWidth = 20; // 200px default width
          nodeHeight = 10; // auto height, approximate
        } else if (nodeType === 'icon') {
          nodeWidth = 4; // 40px default
          nodeHeight = 4;
        }

        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;

        adjustedClientX -= (nodeWidth / 100) * canvasWidth / 2;
        adjustedClientY -= (nodeHeight / 100) * canvasHeight / 2;
      }

      let x = Math.round(((adjustedClientX - canvasRect.left) / canvasRect.width) * 100);
      let y = Math.round(((adjustedClientY - canvasRect.top) / canvasRect.height) * 100);

      // Ensure position stays within canvas bounds
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      // Reset drag offset after use
      setDragOffset(null);

      if (courseId) {
        const newMapItem: MapItem = {
          course_id: courseId,
          x: `${x}%`,
          y: `${y}%`,
        };
        setMaps(prev => [...prev.filter(item => item.course_id !== courseId), newMapItem]);
      } else if (certificateId) {
        const newMapItem: MapItem = {
          certificate_id: certificateId,
          x: `${x}%`,
          y: `${y}%`,
        };
        setMaps(prev => [...prev.filter(item => item.certificate_id !== certificateId), newMapItem]);
      } else if (nodeType === 'text_markdown') {
        const existingNode = nodeData ? JSON.parse(nodeData) : {};
        const newMapItem: MapItem = {
          type: 'text_markdown',
          x: `${x}%`,
          y: `${y}%`,
          markdown_content: existingNode.markdown_content || '# New Markdown\n\nAdd your content here.',
          background_color: existingNode.background_color || 'transparent',
          width: existingNode.width || '200px',
          height: existingNode.height || 'auto',
        };
        setMaps(prev => [
          ...prev.filter(item =>
            !(item.type === 'text_markdown' &&
              item.x === existingNode.x &&
              item.y === existingNode.y)
          ),
          newMapItem
        ]);
      } else if (nodeType === 'icon') {
        const existingNode = nodeData ? JSON.parse(nodeData) : {};
        const newMapItem: MapItem = {
          type: 'icon',
          x: `${x}%`,
          y: `${y}%`,
          width: existingNode.width || '40px',
          height: existingNode.height || '40px',
          hover_content: existingNode.hover_content || 'Icon',
          icon_url: existingNode.icon_url || '',
          link_url: existingNode.link_url || '',
          popup_markdown_content: existingNode.popup_markdown_content || '',
        };
        setMaps(prev => [
          ...prev.filter(item =>
            !(item.type === 'icon' &&
              item.x === existingNode.x &&
              item.y === existingNode.y)
          ),
          newMapItem
        ]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    // Reset drag offset when drag operation ends
    setDragOffset(null);
  };

  const handleRemove = async (itemId: string, isCertificate: boolean = false) => {
    const itemType = isCertificate ? 'certificate' : 'course';
    const result = await showDeleteConfirm(itemType);

    if (result.isConfirmed) {
      if (isCertificate) {
        setMaps(prev => prev.filter(item => item.certificate_id !== itemId));
      } else {
        setMaps(prev => prev.filter(item => item.course_id !== itemId));
      }
      showToast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} removed successfully.`);
    }
  };

  const handleRemoveMarkdown = async (item: MapItem) => {
    const result = await showDeleteConfirm('markdown node');

    if (result.isConfirmed) {
      setMaps(prev => prev.filter(mapItem =>
        !(mapItem.type === 'text_markdown' && mapItem.x === item.x && mapItem.y === item.y)
      ));
      showToast.success('Markdown node removed successfully.');
    }
  };

  const handleEditMarkdown = (item: MapItem) => {
    setEditingMarkdownNode(item);
    setMarkdownContent(item.markdown_content || '# New Markdown\n\nAdd your content here.');
    setMarkdownBackground(item.background_color || 'transparent');
    setMarkdownWidth(item.width || '200px');
    setMarkdownHeight(item.height || 'auto');
    setShowMarkdownForm(true);
  };

  const handleRemoveIcon = async (item: MapItem) => {
    const result = await showDeleteConfirm('icon node');

    if (result.isConfirmed) {
      setMaps(prev => prev.filter(mapItem =>
        !(mapItem.type === 'icon' && mapItem.x === item.x && mapItem.y === item.y)
      ));
      showToast.success('Icon node removed successfully.');
    }
  };

  const handleEditIcon = (item: MapItem) => {
    setIconUrl(item.icon_url || '/icons/info.png');
    setIconHoverText(item.hover_content || '');
    setIconWidth(item.width || '40px');
    setIconHeight(item.height || '40px');
    setIconLinkUrl(item.link_url || '');
    setIconPopupMarkdown(item.popup_markdown_content || '');
    setActionType(item.link_url ? 'link' : item.popup_markdown_content ? 'popup' : '');
    setEditingMarkdownNode(item); // Reuse this state to track which icon we're editing
    setShowIconForm(true);
  };



  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: MapItem) => {
    // Calculate the offset within the node where the user clicked
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDragOffset({ x: offsetX, y: offsetY });

    if (item.course_id) {
      e.dataTransfer.setData('courseId', item.course_id);
    } else if (item.certificate_id) {
      e.dataTransfer.setData('certificateId', item.certificate_id);
    } else if (item.type === 'text_markdown') {
      e.dataTransfer.setData('nodeType', 'text_markdown');
      e.dataTransfer.setData('nodeData', JSON.stringify(item));
    } else if (item.type === 'icon') {
      e.dataTransfer.setData('nodeType', 'icon');
      e.dataTransfer.setData('nodeData', JSON.stringify(item));
    }
  };

  const availableCourses = path.courses.filter(
    (course) => !maps.some((mapItem) => mapItem.course_id === course._id)
  );

  // Check if certificate is already placed on canvas
  const isCertificatePlaced = maps.some((mapItem) => mapItem.certificate_id === 'certificate');

  return (
    <div className="flex flex-col gap-4">
      <div className="px-2 flex justify-between items-center">
        <div className="text-lg font-semibold">Available Courses</div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-neutral-500 rounded-md cursor-pointer text-sm
              font-medium text-neutral-700 bg-white hover:bg-neutral-50"
          >
            <FaImage className="mr-2 h-4 w-4" />
            Change Background
          </button>
          {!isJsonMode ? (
            <button
              onClick={switchToJsonMode}
              className="inline-flex items-center px-4 py-2 border border-neutral-500 rounded-md cursor-pointer text-sm
              font-medium text-neutral-700 bg-white hover:bg-neutral-50"
            >
              <FaCode className="mr-2 h-4 w-4" />
              JSON Editor
            </button>
          ) : (
            <button
              onClick={switchToVisualMode}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
            >
              <FaEye className="mr-2 h-4 w-4" />
              Visual Editor
            </button>
          )}
          <button
            onClick={() => onSave(maps)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md cursor-pointer
               text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <FaSave className="mr-2 h-4 w-4" />
            Save Canvas
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-50 rounded-lg px-4 py-1">
        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden h-[124px]">
          

          {/* Available Courses */}
          <div className='grow px-2 flex items-center gap-1 overflow-x-auto overflow-y-hidden bg-secondary-50'>
            {path.courses.length === 0 ? (
              <div className="w-full flex items-center justify-center">
                <p className="text-gray-500 text-sm italic">There are no courses in this path. You can add them in the 'Courses' tab.</p>
              </div>
            ) : availableCourses.length === 0 ? (
              <div className="w-full flex items-center justify-center">
                <p className="text-gray-500 text-sm italic">All courses have been placed on the canvas.</p>
              </div>
            ) : (
              availableCourses.map((course) => (
                <div
                  key={course._id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('courseId', course._id)}
                  onDragEnd={handleDragEnd}
                  className="flex flex-col items-center cursor-pointer flex-shrink-0 "
                  style={{ width: "140px" }}
                >
                  <div className="relative" style={{
                    width: "72px",
                    height: "72px",
                  }}>
                    <img
                      src="/imgs/bare/course-notyet.png"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div
                    className="mt-0 text-slate-700 text-[12px] w-full h-[44px] over-y-hidden font-semibold text-center leading-tight"
                    title={course.name}
                  >
                    {course.name}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Certificate Item */}
          {!isCertificatePlaced && (
             <div
               draggable
               onDragStart={(e) => e.dataTransfer.setData('certificateId', 'certificate')}
               onDragEnd={handleDragEnd}
               className="flex flex-col items-center cursor-pointer flex-shrink-0 w-fit px-2"
            >
              <div className="relative" style={{
                width: "48px",
                height: "48px",
              }}>
                <div className="h-full w-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <FaGraduationCap className="text-white text-2xl" />
                </div>
              </div>
              <div
                className="mt-0 text-slate-700 text-[12px] font-semibold text-center leading-tight w-full h-fit over-y-hidden"
              >
                Certificate
              </div>
            </div>
          )}

          {/* Add New Node Buttons */}
          <div className="flex gap-2 py-2">
            <button
              onClick={() => {
                setEditingMarkdownNode(null);
                setShowMarkdownForm(true);
              }}
              className="flex flex-col justify-center items-center px-1 py-2 border border-gray-300 rounded-md shadow-sm
                text-xs text-center font-medium text-neutral-500 bg-white hover:bg-gray-50
                min-w-[80px] cursor-pointer hover:opacity-80"
            >
              <FaRegStickyNote className="h-6 w-6 mb-1 text-neutral-500" />
              Add Note
            </button>
            <button
              onClick={() => setShowIconForm(true)}
              className="flex flex-col justify-center items-center px-1 py-2 border border-gray-300 rounded-md
                shadow-sm text-xs font-medium text-neutral-500 bg-white hover:bg-gray-50
                min-w-[80px] cursor-pointer hover:opacity-80"
            >
              <FaImage className="h-6 w-6 mb-1 text-neutral-500" />
              + Icon Icon
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow min-h-[400px]">
        {!isJsonMode ? (
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative w-full h-[560px] rounded-sm border-2 border-dashed border-gray-300"
            style={{
              backgroundImage: `url(${path.background_img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-white opacity-50 z-0"></div>
            {maps.map((item) => {
            if (item.course_id) {
              // Render course item
              const course = path.courses.find(c => c._id === item.course_id);
               return (
                  <div
                    key={`course-${item.course_id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    className="absolute flex flex-col items-center cursor-pointer group hover:shadow-xl transform transition-all origin-center z-20"
                   style={{
                     top: item.y,
                     left: item.x,
                     width: "11vw",
                   }}
                >
                  <div className="relative" style={{
                    width: "5.5vw",
                    height: "5.5vw",
                  }}>
                    <img
                      src="/imgs/bare/course-notyet.png"
                      className="absolute h-full w-full top-0 left-0 z-0 object-contain"
                    />
                    <button
                      onClick={() => handleRemove(item.course_id!, false)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Remove course"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <div
                    className="mt-0 text-slate-700 text-[clamp(11px,0.8vw,16px)] leading-[1.05] font-semibold text-center"
                    style={{
                      maxWidth: "11vw",
                    }}
                  >
                    {course?.name || 'Unknown Course'}
                  </div>
                </div>
              );
            } else if (item.certificate_id) {
              // Render certificate item
               return (
                  <div
                    key={`certificate-${item.certificate_id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    className="absolute flex flex-col items-center cursor-pointer group hover:shadow-xl transform transition-all origin-center z-20"
                   style={{
                     top: item.y,
                     left: item.x,
                     width: "11vw",
                   }}
                >
                  <div className="relative p-2" style={{
                    width: "5.5vw",
                    height: "5.5vw",
                  }}>
                    <div className="h-full w-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <FaGraduationCap className="text-white text-3xl" />
                    </div>
                    <button
                      onClick={() => handleRemove(item.certificate_id!, true)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Remove certificate"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <div
                    className="mt-0 text-slate-700 text-[clamp(11px,0.8vw,16px)] font-semibold text-center leading-none"
                    style={{
                      maxWidth: "11vw",
                    }}
                  >
                    Certificate
                  </div>
                </div>
              );
            } else if (item.type === 'text_markdown') {
              // Render text_markdown item
              return (
                   <div
                     key={`markdown-${item.x}-${item.y}`}
                     draggable
                     onDragStart={(e) => handleDragStart(e, item)}
                     onDragEnd={handleDragEnd}
                     onClick={(e) => {
                       e.stopPropagation();
                       handleEditMarkdown(item);
                     }}
                     className="absolute cursor-pointer group hover:shadow-xl hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 transform transition-all origin-center z-20"
                    style={{
                      top: item.y,
                      left: item.x,
                      backgroundColor: item.background_color || 'transparent',
                      padding: '8px',
                      borderRadius: '4px',
                      width: item.width || '200px',
                      maxWidth: item.width || '200px',
                      minHeight: item.height || 'auto',
                    }}
                   title="Markdown Node"
                 >
                  <div className="text-sm text-gray-800">
                    <MarkdownRender>
                      {item.markdown_content || 'Markdown content'}
                    </MarkdownRender>
                  </div>
                  <button
                    onClick={() => handleRemoveMarkdown(item)}
                    className="absolute top-[-20px] right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Remove markdown node"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              );
            } else if (item.type === 'icon') {
              // Render icon item
              return (
                   <div
                     key={`icon-${item.x}-${item.y}`}
                     draggable
                     onDragStart={(e) => handleDragStart(e, item)}
                     onDragEnd={handleDragEnd}
                     className="absolute cursor-pointer group hover:shadow-xl transform transition-all origin-center z-20"
                     style={{
                       top: item.y,
                       left: item.x,
                     }}
                    title={item.hover_content || 'Icon Node'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditIcon(item);
                      
                    }}
                  >
                  <div
                    className="relative"
                    style={{
                      width: item.width || '40px',
                      height: item.height || '40px',
                    }}
                  >
                    {item.icon_url ? (
                      <img
                        src={item.icon_url}
                        alt={item.hover_content || 'Icon'}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs">
                        Icon
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveIcon(item);
                      }}
                      className="absolute top-[-20px] right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Remove icon node"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
        ) : (
          <div className="relative w-full h-[560px] rounded-sm border-2 border-gray-300 bg-gray-50">
            <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">JSON Editor</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Edit the map items as JSON array. Each item should have x, y coordinates and node-specific properties.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={formatJson}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Format JSON
                  </button>
                  <button
                    onClick={handleJsonSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <FaSave className="mr-2 h-4 w-4" />
                    Save JSON
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language="json"
                  value={jsonContent}
                  onChange={handleJsonChange}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Markdown Node Form */}
      {showMarkdownForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingMarkdownNode ? 'Edit Markdown Node' : 'Add Markdown Node'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <input
                    type="text"
                    value={markdownWidth}
                    onChange={(e) => setMarkdownWidth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="200px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height
                  </label>
                  <input
                    type="text"
                    value={markdownHeight}
                    onChange={(e) => setMarkdownHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <select
                    value={markdownBackground}
                    onChange={(e) => setMarkdownBackground(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="transparent">Transparent</option>
                    <option value="#f3f4f6">Light Gray</option>
                    <option value="#dbeafe">Light Blue</option>
                    <option value="#dcfce7">Light Green</option>
                    <option value="#fef3c7">Light Yellow</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Markdown Content
                </label>
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter markdown content..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowMarkdownForm(false);
                  setEditingMarkdownNode(null);
                  setMarkdownContent('# New Markdown\n\nAdd your content here.');
                  setMarkdownBackground('transparent');
                  setMarkdownWidth('200px');
                  setMarkdownHeight('auto');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingMarkdownNode) {
                    // Update existing node
                    const updatedNode: MapItem = {
                      ...editingMarkdownNode,
                      markdown_content: markdownContent,
                      background_color: markdownBackground,
                      width: markdownWidth,
                      height: markdownHeight,
                    };
                    setMaps(prev => prev.map(item =>
                      item === editingMarkdownNode ? updatedNode : item
                    ));
                    showToast.success('Markdown node updated successfully.');
                  } else {
                    // Create new node
                    const newNode: MapItem = {
                      type: 'text_markdown',
                      x: '50%',
                      y: '50%',
                      markdown_content: markdownContent,
                      background_color: markdownBackground,
                      width: markdownWidth,
                      height: markdownHeight,
                    };
                    setMaps(prev => [...prev, newNode]);
                    showToast.success('Markdown node added successfully.');
                  }

                  setShowMarkdownForm(false);
                  setEditingMarkdownNode(null);
                  setMarkdownContent('# New Markdown\n\nAdd your content here.');
                  setMarkdownBackground('transparent');
                  setMarkdownWidth('200px');
                  setMarkdownHeight('auto');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingMarkdownNode ? 'Update Node' : 'Add Node'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Node Form */}
      {showIconForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-[600px] max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">{editingMarkdownNode ? 'Edit Icon Node' : 'Add Icon Node'}</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    Icon
                  </label>
                  <textarea
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    className="w-full h-16 px-2 py-1 border border-gray-300 rounded-md text-xs"
                    placeholder="https://example.com/icon.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: /icons/info.png</p>
                </div>
                <div className="w-30">
                  <div className="">
                    <ImageEditor
                      label=""
                      imageUrl={iconUrl || '/icons/info.png'}
                      onImageUrlChange={(url) => setIconUrl(url || '/icons/info.png')}
                      mode="avatar"
                      allowDelete={false}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-20">
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    Width
                  </label>
                  <input
                    type="text"
                    value={iconWidth}
                    onChange={(e) => setIconWidth(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    placeholder="40px"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    Height
                  </label>
                  <input
                    type="text"
                    value={iconHeight}
                    onChange={(e) => setIconHeight(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    placeholder="40px"
                  />
                </div>
                <div className="grow">
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    Hover Text <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={iconHoverText}
                    onChange={(e) => setIconHoverText(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    placeholder="Text shown on hover"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action when user clicks:
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="actionType"
                        value="link"
                        checked={actionType === 'link'}
                        onChange={() => {
                          setActionType('link');
                          setIconPopupMarkdown('');
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Open Link</span>
                    </label>
                    {actionType === 'link' && (
                      <input
                        type="text"
                        value={iconLinkUrl}
                        onChange={(e) => setIconLinkUrl(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md mt-1 text-sm"
                        placeholder="https://example.com"
                      />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="actionType"
                        value="popup"
                        checked={actionType === 'popup'}
                        onChange={() => {
                          setActionType('popup');
                          setIconLinkUrl('');
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Show Popup</span>
                    </label>
                    {actionType === 'popup' && (
                      <textarea
                        value={iconPopupMarkdown}
                        onChange={(e) => setIconPopupMarkdown(e.target.value)}
                        rows={4}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md mt-1 text-sm"
                        placeholder="Enter markdown content for popup..."
                      />
                    )}
                  </div>
                </div>
                {!actionType && (
                  <p className="text-sm text-amber-600 mt-1">Please select an action type.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowIconForm(false);
                  setIconUrl('/icons/info.png');
                  setIconHoverText('');
                  setIconWidth('40px');
                  setIconHeight('40px');
                  setIconLinkUrl('');
                  setIconPopupMarkdown('');
                  setActionType('');
                  setEditingMarkdownNode(null);
                }}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!actionType) {
                    showToast.error('Please select an action type (Open Link or Show Popup).');
                    return;
                  }

                  if (editingMarkdownNode) {
                    // Update existing icon node
                    const updatedNode: MapItem = {
                      ...editingMarkdownNode,
                      width: iconWidth,
                      height: iconHeight,
                      hover_content: iconHoverText,
                      icon_url: iconUrl,
                      link_url: iconLinkUrl,
                      popup_markdown_content: iconPopupMarkdown,
                    };
                    setMaps(prev => prev.map(item =>
                      item === editingMarkdownNode ? updatedNode : item
                    ));
                    showToast.success('Icon node updated successfully.');
                  } else {
                    // Create new icon node
                    const newNode: MapItem = {
                      type: 'icon',
                      x: '50%',
                      y: '50%',
                      width: iconWidth,
                      height: iconHeight,
                      hover_content: iconHoverText,
                      icon_url: iconUrl,
                      link_url: iconLinkUrl,
                      popup_markdown_content: iconPopupMarkdown,
                    };
                    setMaps(prev => [...prev, newNode]);
                    showToast.success('Icon node added successfully.');
                  }

                  setShowIconForm(false);
                  setIconUrl('/icons/info.png');
                  setIconHoverText('');
                  setIconWidth('40px');
                  setIconHeight('40px');
                  setIconLinkUrl('');
                  setIconPopupMarkdown('');
                  setActionType('');
                  setEditingMarkdownNode(null);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {editingMarkdownNode ? 'Update Node' : 'Add Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathCanvasEditor;