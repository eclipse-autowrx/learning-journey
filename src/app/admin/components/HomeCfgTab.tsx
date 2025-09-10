'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaHome, FaUndo, FaPlus, FaTrash, FaUpload } from 'react-icons/fa';
import { FaDiamond } from 'react-icons/fa6';

interface SystemSetting {
  _id: string;
  key: string;
  value: any;
  secret: boolean;
  description?: string;
  category: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

interface HomeConfig {
  title: string;
  bulletPoints: string[];
  imageUrl: string;
}

interface HomeCfgTabProps {
  hasManageUsers: boolean;
}

export default function HomeCfgTab({ hasManageUsers }: HomeCfgTabProps) {
  const [homeConfig, setHomeConfig] = useState<HomeConfig>({
    title: 'Your SDV journey starts here.',
    bulletPoints: [
      'From zero to hero',
      'Practice in our virtual lab and seamlessly transition to physical kit',
      'Track your progress and get certificates',
      'Stay in the loop with our community'
    ],
    imageUrl: '/imgs/sdv.png'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!hasManageUsers) return;
    fetchHomeConfig();
  }, [hasManageUsers]);

  const fetchHomeConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const homeConfigSetting = data.data.find((setting: SystemSetting) => setting.key === 'home_config');
          if (homeConfigSetting?.value) {
            setHomeConfig(homeConfigSetting.value);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching home config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First try to update existing setting
      let response = await fetch('/api/admin/settings/home_config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: homeConfig }),
      });

      // If setting doesn't exist (404), create it
      if (response.status === 404) {
        response = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'home_config',
            value: homeConfig,
            secret: false,
            description: 'Home page configuration including title, bullet points, and hero image',
            category: 'ui'
          }),
        });
      }

      if (response.ok) {
        setHasChanges(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to save home config:', errorData.error);
      }
    } catch (error) {
      console.error('Error saving home config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setHomeConfig({
      title: 'Your SDV journey starts here.',
      bulletPoints: [
        'From zero to hero',
        'Practice in our virtual lab and seamlessly transition to physical kit',
        'Track your progress and get certificates',
        'Stay in the loop with our community'
      ],
      imageUrl: '/imgs/sdv.png'
    });
    setHasChanges(true);
  };

  const handleTitleChange = (value: string) => {
    setHomeConfig(prev => ({ ...prev, title: value }));
    setHasChanges(true);
  };

  const handleBulletPointChange = (index: number, value: string) => {
    setHomeConfig(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.map((point, i) => i === index ? value : point)
    }));
    setHasChanges(true);
  };

  const addBulletPoint = () => {
    setHomeConfig(prev => ({
      ...prev,
      bulletPoints: [...prev.bulletPoints, 'New bullet point']
    }));
    setHasChanges(true);
  };

  const removeBulletPoint = (index: number) => {
    setHomeConfig(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/medias/upload_image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          setHomeConfig(prev => ({ ...prev, imageUrl: data.url }));
          setHasChanges(true);
        } else {
          console.error('Failed to upload image:', data.error);
        }
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!hasManageUsers) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500">
        <p>You don't have permission to manage home configuration.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading home configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaHome className="h-6 w-6 text-primary-500" />
          <h2 className="text-xl font-semibold text-neutral-900">Home Page Configuration</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md"
          >
            <FaUndo className="mr-2 h-4 w-4" />
            Reset to Default
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md disabled:opacity-50"
            >
              <FaSave className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Split Layout for Config */}
      <div className="flex gap-6 mb-6">
        {/* Left Side - Configuration (1/2) */}
        <div className="w-1/2 flex flex-col gap-6">
          {/* Title Configuration */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">Main Title</h3>
            </div>
            <div className="p-4">
              <textarea
                value={homeConfig.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Enter the main title for the home page"
              />
            </div>
          </div>

          {/* Bullet Points Configuration */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-900">Bullet Points</h3>
                <button
                  onClick={addBulletPoint}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Add Point
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {homeConfig.bulletPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <textarea
                    value={point}
                    onChange={(e) => handleBulletPointChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                    placeholder="Enter bullet point text"
                  />
                  <button
                    onClick={() => removeBulletPoint(index)}
                    className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    disabled={homeConfig.bulletPoints.length <= 1}
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Image Configuration (1/2) */}
        <div className="w-1/2">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">Hero Image</h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Current Image Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={homeConfig.imageUrl}
                    alt="Hero image preview"
                    className="max-w-full max-h-48 rounded-lg border border-neutral-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/imgs/sdv.png';
                    }}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Upload New Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer ${
                      isUploading
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    <FaUpload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Choose Image'}
                  </label>
                  <span className="text-sm text-neutral-500">
                    {isUploading ? 'Uploading image...' : 'JPG, PNG, GIF up to 10MB'}
                  </span>
                </div>
              </div>

              {/* Current Image URL */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Image URL
                </label>
                <input
                  type="text"
                  value={homeConfig.imageUrl}
                  onChange={(e) => {
                    setHomeConfig(prev => ({ ...prev, imageUrl: e.target.value }));
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter image URL or upload a new image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview - Full Width Row */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">Live Preview</h3>
        </div>
        <div className="p-4">
          {/* Exact replica of home page first section */}
          <div className="w-full bg-gradient-to-br from-primary-800 via-primary-800 to-primary-700 text-white flex flex-col items-center justify-center pt-8 pb-8 px-6 lg:px-12">
            <div className="container h-full flex sm:flex-row flex-col gap-6">
              <div className="flex-3 px-2">
                <div className="text-2xl sm:text-2xl lg:text-4xl font-bold pt-8 text-left">
                  {homeConfig.title}
                </div>
                <div className="text-sm sm:text-md leading-tight font-bold text-left pt-4 mt-4 flex flex-col gap-2">
                  {homeConfig.bulletPoints.map((point, index) => (
                    <div key={index} className="flex items-center">
                      <FaDiamond size={12} className="mr-4 text-white min-w-3" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-2 px-2 grid place-items-center">
                <img
                  className="w-[60vw] sm:w-[40vw]"
                  src={homeConfig.imageUrl}
                  alt="Hero image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/imgs/sdv.png';
                  }}
                />
              </div>
            </div>

            <div className="container h-full flex flex-col gap-2 mt-8">
              <div className="w-full text-center">How do you want to start?</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2 text-xs sm:text-sm lg:text-base xl:text-base text-center leading-tight">
                <a href="#pathList" className="flex">
                  <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                    <img className="h-28 p-4" src="/imgs/learning_path_icon.png" />
                    <div className="font-bold px-4 py-1 text-neutral-500">I want to follow a guided path</div>
                  </div>
                </a>

                <a href="/manage" className="flex">
                  <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                    <img className="h-28" src="/imgs/edit_path_icon.jpg" />
                    <div className="font-bold px-4 py-1 text-neutral-500">I want to design a new path</div>
                  </div>
                </a>

                <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                  <img className="h-28" src="/imgs/hackathon.png" />
                  <div className="font-bold px-4 py-1 text-neutral-500">I want to plan a hackathon</div>
                </div>

                <a href="#dreamkit" className="flex">
                  <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                    <img className="h-28" src="/imgs/dreamKit.png" />
                    <div className="font-bold px-4 py-1 text-neutral-500">I want to work with dreamKIT</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}