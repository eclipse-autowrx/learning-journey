'use client';

import React, { ReactNode } from 'react';
import { FaRoute, FaGraduationCap, FaBook } from 'react-icons/fa';

import TextMarkdownEditor from '@/app/components/lessons/TextMarkdownEditor';
import QuizLessonEditor from '@/app/components/lessons/QuizLessonEditor';
import VideoLessonEditor from '@/app/components/lessons/VideoLessonEditor';
import InteractiveLessonEditor from '@/app/components/lessons/InteractiveLessonEditor';
import UnknownLessonEditor from '@/app/components/lessons/UnknownLessonEditor';

const mapLessonForRender = (lesson: any) => {
  const common = {
    ...lesson,
    name: lesson.name || '',
    description: lesson.description || '',
    slug: lesson.slug || '',
  };
  switch (lesson.lesson_type) {
    case 'video':
      return { ...common, video_url: lesson.video_url || '', video_provider: lesson.video_provider || 'youtube' };
    case 'text-markdown':
      return { ...common, markdown_content: lesson.markdown_content || '' };
    case 'quiz':
      return { ...common, quiz_questions: lesson.quiz_questions || [], passing_score: lesson.passing_score || 70 };
    case 'interactive':
      return { ...common, ...lesson.sequence };
    default:
      return common;
  }
};

const EditorCard = ({ title, icon, children }: { title: string, icon: ReactNode, children: ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-bold ml-3 text-gray-800">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const TextInput = ({ value, onChange }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <input
        type="text"
        value={value || ''}
        onChange={onChange}
        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
    />
);

const TextArea = ({ value, onChange }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) => (
    <textarea
        value={value || ''}
        onChange={onChange}
        rows={4}
        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
    />
);


const ImageViewer = ({ src, alt }: { src: string, alt: string }) => (
    <img src={src} alt={alt} className="w-full h-auto rounded-lg object-cover border" />
);


export default function ImportContentViewer({ selectedItem, imageUrls, onItemChange }: { selectedItem: any, imageUrls: Record<string, string>, onItemChange: (item: any) => void }) {
  if (!selectedItem) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Select an item from the tree to view its details.</p>
      </div>
    );
  }

  const { item, type } = selectedItem;

  const handleChange = (field: string, value: any) => {
    onItemChange({ ...item, [field]: value });
  };
  
  const handleLessonContentChange = (changedContent: any) => {
    onItemChange({ ...item, ...changedContent });
  };


  const renderContent = () => {
    switch (type) {
      case 'path':
        return (
          <EditorCard title="Edit Path" icon={<FaRoute size="24" className="text-blue-500" />}>
            <Field label="Name">
                <TextInput value={item.name} onChange={(e) => handleChange('name', e.target.value)} />
            </Field>
            <Field label="Description">
                <TextArea value={item.description} onChange={(e) => handleChange('description', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              {item.image && imageUrls[item.image] && <ImageViewer src={imageUrls[item.image]} alt="Path Image" />}
              {item.thumb && imageUrls[item.thumb] && <ImageViewer src={imageUrls[item.thumb]} alt="Path Thumbnail" />}
            </div>
          </EditorCard>
        );
      case 'course':
        return (
          <EditorCard title="Edit Course" icon={<FaGraduationCap size="24" className="text-green-500" />}>
            <Field label="Name">
                <TextInput value={item.name} onChange={(e) => handleChange('name', e.target.value)} />
            </Field>
            <Field label="Description">
                <TextArea value={item.description} onChange={(e) => handleChange('description', e.target.value)} />
            </Field>
            {item.image && imageUrls[item.image] && <ImageViewer src={imageUrls[item.image]} alt="Course Image" />}
          </EditorCard>
        );
      case 'lesson':
        const adaptedLesson = mapLessonForRender(item);
        const lessonEditorProps = {
            value: adaptedLesson,
            onChange: handleLessonContentChange,
        };

        let LessonEditorComponent;
        switch (item.lesson_type) {
            case 'text-markdown':
                LessonEditorComponent = TextMarkdownEditor;
                break;
            case 'quiz':
                LessonEditorComponent = QuizLessonEditor;
                break;
            case 'video':
                LessonEditorComponent = VideoLessonEditor;
                break;
            case 'interactive':
                LessonEditorComponent = InteractiveLessonEditor;
                break;
            default:
                LessonEditorComponent = UnknownLessonEditor;
        }

        return (
          <EditorCard title="Edit Lesson" icon={<FaBook size="24" className="text-purple-500" />}>
            <Field label="Name">
                <TextInput value={item.name} onChange={(e) => handleChange('name', e.target.value)} />
            </Field>
            <Field label="Description">
                <TextArea value={item.description} onChange={(e) => handleChange('description', e.target.value)} />
            </Field>
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Lesson Content</h4>
              <div className="p-4 border rounded-md bg-gray-50">
                <LessonEditorComponent {...lessonEditorProps} />
              </div>
            </div>
          </EditorCard>
        );
      default:
        return <p>Unknown item type.</p>;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}
