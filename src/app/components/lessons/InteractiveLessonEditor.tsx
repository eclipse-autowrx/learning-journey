// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaGripVertical, FaChevronDown, FaChevronRight, FaAngleDoubleDown, FaAngleDoubleUp, FaCode, FaList } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Editor from '@monaco-editor/react';
import { showDeleteConfirm } from '@/lib/utils/notifications';

interface FinishCondition {
  type: string;
  target_element_path: string;
  expectedValue: string;
}

interface Action {
  name: string;
  path: string;
  actionType: string;
  value: string | null;
  tooltipMessage: string;
  delayBefore: number;
  delayAfter: number;
  finish_condition?: FinishCondition;
}

interface InteractiveLesson {
  name: string;
  description: string;
  sequence: any;
}

interface InteractiveLessonEditorProps {
  value: Partial<InteractiveLesson>;
  onChange: (value: Partial<InteractiveLesson>) => void;
}

const FINISH_CONDITION_TYPES = ["location-match", "element_visible", "has-value", "element_clicked"];
const ACTION_TYPES = ["show_tooltip", "click", "set_value", "run_script"];

interface ActionEditorProps {
  action: Action;
  index: number;
  onActionChange: (index: number, action: Action) => void;
  onDelete: (index: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ActionEditor = ({ action, index, onActionChange, onDelete, isExpanded, onToggleExpand }: ActionEditorProps) => {

  const handleChange = (field: keyof Action, value: any) => {
    onActionChange(index, { ...action, [field]: value });
  };

  const handleConditionChange = (field: keyof FinishCondition, value: any) => {
    const newCondition = { ...(action.finish_condition || { type: '', target_element_path: '', expectedValue: '' }), [field]: value };
    onActionChange(index, { ...action, finish_condition: newCondition });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-md">
      <button
        onClick={onToggleExpand}
        className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-t-md"
      >
        <div className="flex items-center">
          {isExpanded ? <FaChevronDown className="mr-2 h-3 w-3" /> : <FaChevronRight className="mr-2 h-3 w-3" />}
          <span className="font-bold text-gray-700">{action.name || `Action ${index + 1}`}</span>
        </div>
        <div onClick={(e) => { 
          e.stopPropagation(); 
          onDelete(index); }} 
          className="text-red-500 cursor-pointer hover:opacity-70 hover:text-red-700">
          <FaTrash />
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Action Name</label>
              <input type="text" value={action.name} onChange={(e) => handleChange('name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Element Path</label>
              <input type="text" value={action.path} onChange={(e) => handleChange('path', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Action Type</label>
              <select value={action.actionType} onChange={e => handleChange('actionType', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                {ACTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Value</label>
              <input type="text" value={action.value || ''} onChange={(e) => handleChange('value', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tooltip Message</label>
            <textarea value={action.tooltipMessage} onChange={(e) => handleChange('tooltipMessage', e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Delay Before (ms)</label>
              <input type="number" value={action.delayBefore} onChange={(e) => handleChange('delayBefore', parseInt(e.target.value, 10))} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Delay After (ms)</label>
              <input type="number" value={action.delayAfter} onChange={(e) => handleChange('delayAfter', parseInt(e.target.value, 10))} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Finish Condition</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Condition Type</label>
                <select value={action.finish_condition?.type || ''} onChange={e => handleConditionChange('type', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">None</option>
                  {FINISH_CONDITION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Element Path</label>
                <input type="text" value={action.finish_condition?.target_element_path || ''} onChange={(e) => handleConditionChange('target_element_path', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Value</label>
                <input type="text" value={action.finish_condition?.expectedValue || ''} onChange={(e) => handleConditionChange('expectedValue', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default function InteractiveLessonEditor({ value, onChange }: InteractiveLessonEditorProps) {
  const [expandedState, setExpandedState] = useState<{ [key: number]: boolean }>({});
  const [viewMode, setViewMode] = useState<'ui' | 'json'>('ui');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const lesson: Partial<InteractiveLesson> = {
    ...value,
    name: value.name || '',
    description: value.description || '',
    sequence: value.sequence || {
      auto_run_next: true,
      auto_start: true,
      trigger_source: 'learning',
      actions: [],
    },
  };

  const sequence: Partial<any> = {
    ...value.sequence,
    actions: value.sequence.actions || [],
  };

  // Effect to initialize expanded state
  useEffect(() => {
    const initialState = (sequence.actions || []).reduce((acc: { [key: number]: boolean }, _: any, index: number) => {
      acc[index] = false; // Default to collapsed
      return acc;
    }, {});
    setExpandedState(initialState);
  }, [sequence.actions?.length]);


  const handleFieldChange = (field: keyof any, fieldValue: any) => {
    onChange({ ...lesson, sequence: { ...sequence, [field]: fieldValue } });
  };

  const handleActionChange = (index: number, newAction: Action) => {
    const newActions = [...(sequence.actions || [])];
    newActions[index] = newAction;
    onChange({ ...lesson, sequence: { ...sequence, actions: newActions } });
  };

  const handleAddAction = () => {
    console.log('handleAddAction')
    const newAction: Action = {
      name: `New Action ${(sequence.actions?.length || 0) + 1}`,
      path: "",
      actionType: "show_tooltip",
      value: null,
      tooltipMessage: "",
      delayBefore: 500,
      delayAfter: 500,
      finish_condition: {
        type: "element_clicked",
        target_element_path: "",
        expectedValue: ""
      }
    };
    const newActions = [...(sequence.actions || []), newAction];
    setExpandedState(prev => ({ ...prev, [newActions.length - 1]: true }));
    console.log('newActions', newActions)
    onChange({ ...lesson, sequence: { ...sequence, actions: newActions } });
  };

  const handleDeleteAction = async (index: number) => {
    const action = sequence.actions?.[index];
    const actionName = action?.name || `Action ${index + 1}`;
    
    const result = await showDeleteConfirm(`action "${actionName}"`);
    if (!result.isConfirmed) {
      return;
    }
    
    const newActions = (sequence.actions || []).filter((_: any, i: number) => i !== index);
    onChange({ ...lesson, sequence: { ...sequence, actions: newActions } });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newActions = Array.from(sequence.actions || []);
    const [reorderedItem] = newActions.splice(result.source.index, 1);
    newActions.splice(result.destination.index, 0, reorderedItem);
    onChange({ ...lesson, sequence: { ...sequence, actions: newActions } });
  };

  const handleJsonChange = (value: string) => {
    try {
      const parsedActions = JSON.parse(value);
      console.log('parsedActions', parsedActions)
      if (Array.isArray(parsedActions)) {
        onChange({ ...lesson, sequence: { ...sequence, actions: parsedActions } });
        setJsonError(null);
      } else {
        setJsonError('JSON must be an array of actions.');
      }
    } catch (error) {
      setJsonError('Invalid JSON format.');
      console.log('Invalid JSON format.')
      console.log('error', error)
    }
  };

  const toggleAll = (expand: boolean) => {
    const newState = Object.keys(expandedState).reduce((acc: { [key: string]: boolean }, key) => {
      acc[key] = expand;
      return acc;
    }, {});
    setExpandedState(newState);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50">
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <input type="checkbox" checked={sequence.auto_start} 
              onChange={(e) => handleFieldChange('auto_start', e.target.checked)} 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label className="ml-2 block text-sm text-gray-900">Auto Start</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" checked={sequence.auto_run_next} 
              onChange={(e) => handleFieldChange('auto_run_next', e.target.checked)} 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label className="ml-2 block text-sm text-gray-900">Auto Run Next</label>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Actions</h3>
          <div className="flex items-center space-x-2">
            <button onClick={() => toggleAll(true)} className="p-1.5 hover:bg-gray-200 rounded" title="Expand All">
              <FaAngleDoubleDown />
            </button>
            <button onClick={() => toggleAll(false)} className="p-1.5 hover:bg-gray-200 rounded" title="Collapse All">
              <FaAngleDoubleUp />
            </button>
            <div className="flex items-center rounded-md border p-0.5 bg-gray-100 space-x-1">
              <button
                onClick={() => setViewMode('ui')}
                className={`px-3 py-0.5 text-sm rounded-sm flex items-center ${viewMode === 'ui' ? 'bg-white shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                title="List Mode"
              >
                <FaList className="mr-1.5 h-3 w-3" />
                List
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-0.5 text-sm rounded-sm flex items-center ${viewMode === 'json' ? 'bg-white shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                title="Raw Mode"
              >
                <FaCode className="mr-1.5 h-3 w-3" />
                Raw
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'ui' ? (
          <>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="actions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {(sequence.actions || []).map((action: any, index: number) => (
                      <Draggable key={index} draggableId={`action-${index}`} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <div {...provided.dragHandleProps} className="inline-block cursor-grab"><FaGripVertical className="text-gray-400 mr-2" /></div>
                            <div className="inline-block w-[calc(100%-24px)]">
                              <ActionEditor
                                index={index}
                                action={action}
                                onActionChange={handleActionChange}
                                onDelete={handleDeleteAction}
                                isExpanded={expandedState[index] ?? true}
                                onToggleExpand={() => setExpandedState(prev => ({ ...prev, [index]: !prev[index] }))}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button onClick={handleAddAction} className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800">
              <FaPlus className="mr-2" /> Add Action
            </button>
          </>
        ) : (
          <div>
            <Editor
              height="400px"
              language="json"
              value={JSON.stringify(sequence.actions || [], null, 2)}
              onChange={(value) => handleJsonChange(value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
              }}
              className={`border ${jsonError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {jsonError && <p className="text-xs text-red-600 mt-1">{jsonError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
