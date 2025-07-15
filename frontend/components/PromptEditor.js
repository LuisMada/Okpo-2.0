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

  const getCharacterCount = () => {
    return formData.content.length
  }

  const charCount = getCharacterCount()

  return (
    <div className="card animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-okpo-500 to-okpo-600 rounded-xl p-3 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isEdit ? `Edit Prompt: ${prompt.name}` : 'Create New Prompt'}
            </h3>
            {isEdit && (
              <div className="flex items-center space-x-3 mt-2">
                <span className={getLayerBadgeClass(prompt.layer_type)}>
                  {prompt.layer_type}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  v{prompt.version}
                </span>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={onCancel} 
          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
        </div>

        {/* Layer Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Layer Type *
          </label>
          <div className="relative">
            <select
              value={formData.layer_type}
              onChange={(e) => handleInputChange('layer_type', e.target.value)}
              className="input-field pr-10"
              required
            >
              {layerTypes.map((layer) => (
                <option key={layer.name} value={layer.name}>
                  {layer.name.charAt(0).toUpperCase() + layer.name.slice(1)} - {layer.description}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Prompt Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className="textarea-field"
            rows="10"
            placeholder="Enter the prompt logic here..."
            required
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{charCount} characters</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200 shadow-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="input-field pr-10"
                placeholder="Add tag..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary"
              disabled={!tagInput.trim() || formData.tags.includes(tagInput.trim())}
            >
              Add
            </button>
          </div>
        </div>

        {/* Change Comment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
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
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Required for version tracking and audit trail</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
            {saving ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                {isEdit ? 'Save New Version' : 'Create Prompt'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}