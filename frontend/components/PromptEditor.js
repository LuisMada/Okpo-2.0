import { useState, useEffect } from 'react'

export default function PromptEditor({ prompt, layerTypes, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    layer_type: 'global',
    change_comment: '',
    tags: [],
    author: 'User' // In real app, get from auth
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    if (prompt && prompt.id) {
      setIsEdit(true)
      setFormData({
        name: prompt.name || '',
        description: prompt.description || '',
        content: prompt.content || '',
        layer_type: prompt.layer_type || 'global',
        change_comment: '',
        tags: prompt.tags || [],
        author: 'User'
      })
    } else {
      setIsEdit(false)
      setFormData({
        name: '',
        description: '',
        content: '',
        layer_type: 'global',
        change_comment: '',
        tags: [],
        author: 'User'
      })
    }
  }, [prompt])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Name and content are required')
      return
    }

    if (!formData.change_comment.trim()) {
      alert('Change comment is required for version tracking')
      return
    }

    setSaving(true)

    try {
      const payload = {
        ...formData,
        parent_id: isEdit ? prompt.id : null
      }

      const response = await fetch('http://localhost:8000/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail || 'Failed to save prompt'}`)
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Failed to save prompt. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getLayerBadgeClass = (layerType) => {
    return `layer-badge layer-${layerType}`
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? `Edit Prompt: ${prompt.name}` : 'Create New Prompt'}
          </h3>
          {isEdit && (
            <div className="flex items-center space-x-2 mt-2">
              <span className={getLayerBadgeClass(prompt.layer_type)}>
                {prompt.layer_type}
              </span>
              <span className="text-sm text-gray-500">v{prompt.version}</span>
            </div>
          )}
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="input-field"
            placeholder="e.g., Global Safety Rules"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="input-field"
            placeholder="Brief description of this prompt's purpose"
          />
        </div>

        {/* Layer Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layer Type *
          </label>
          <select
            value={formData.layer_type}
            onChange={(e) => handleInputChange('layer_type', e.target.value)}
            className="input-field"
            required
          >
            {layerTypes.map((layer) => (
              <option key={layer.name} value={layer.name}>
                {layer.name.charAt(0).toUpperCase() + layer.name.slice(1)} - {layer.description}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className="textarea-field"
            rows="8"
            placeholder="Enter the prompt logic here..."
            required
          />
          <div className="text-sm text-gray-500 mt-1">
            {formData.content.length} characters
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="input-field"
              placeholder="Add tag..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Change Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Change Comment *
          </label>
          <textarea
            value={formData.change_comment}
            onChange={(e) => handleInputChange('change_comment', e.target.value)}
            className="textarea-field"
            rows="3"
            placeholder={isEdit ? "Explain what changed and why..." : "Initial creation of this prompt"}
            required
          />
          <div className="text-sm text-gray-500 mt-1">
            Required for version tracking and audit trail
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : (isEdit ? 'Save New Version' : 'Create Prompt')}
          </button>
        </div>
      </form>
    </div>
  )
}