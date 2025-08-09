'use client'

import { useState, useEffect } from 'react'

export default function TextMarkdownEditor({ value, onChange }) {
  const [markdown, setMarkdown] = useState('')

  useEffect(() => {
    setMarkdown(value?.markdown_content || '')
  }, [value])

  const update = (md) => {
    setMarkdown(md)
    onChange && onChange({ markdown_content: md })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Markdown Content</label>
        <textarea
          rows={14}
          className="mt-1 min-h-[400px] block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
          value={markdown}
          onChange={(e) => update(e.target.value)}
        />
      </div>
    </div>
  )
}
