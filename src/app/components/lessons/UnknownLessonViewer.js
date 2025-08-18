// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

export default function UnknownLessonViewer({ lesson }) {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsupported lesson type</h3>
      <p className="text-sm text-gray-600 mb-4">
        Type: <span className="font-mono">{lesson?.lesson_type || 'unknown'}</span>
      </p>
      <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto">
{JSON.stringify(lesson, null, 2)}
      </pre>
    </div>
  )
}


