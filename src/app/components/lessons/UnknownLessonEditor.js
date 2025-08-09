'use client'

export default function UnknownLessonEditor({ value, onChange }) {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No editor available</h3>
      <p className="text-sm text-gray-600 mb-4">
        Type: <span className="font-mono">{value?.lesson_type || 'unknown'}</span>
      </p>
      <textarea
        className="w-full min-h-64 text-xs bg-gray-50 p-3 rounded border border-gray-200 font-mono"
        value={JSON.stringify(value || {}, null, 2)}
        onChange={() => {}}
        readOnly
      />
    </div>
  )
}


