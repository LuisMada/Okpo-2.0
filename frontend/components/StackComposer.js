import { useState, useEffect } from 'react'

export default function StackComposer({ stack, prompts, layerTypes, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompts: {},      // layer_type -> prompt_id
    weights: {},      // layer_type -> weight
    locks: {},        // layer_type -> boolean
    author: 'User'
  })
  const [compiledPreview, setCompiledPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    if (stack && stack.id) {
      setIsEdit(true)
      setFormData({
        name: stack.name || '',
        description: stack.description || '',
        prompts: stack.prompts || {},
        weights: stack.weights || {},
        locks: stack.locks || {},
        author: 'User'
      })
    } else {
      setIsEdit(false)
      setFormData({
        name: '',
        description: '',
        prompts: {},
        weights: {},
        locks: {},
        author: 'User'
      })
    }
  }, [stack])

  // Update preview when prompts change
  useEffect(() => {
    if (Object.keys(formData.prompts).length > 0) {
      generatePreview()
    } else {
      setCompiledPreview(null)
    }
  }, [formData.prompts, formData.weights, formData.locks])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePromptSelect = (layerType, promptId) => {
    setFormData(prev => ({
      ...prev,
      prompts: {
        ...prev.prompts,
        [layerType]: promptId || undefined
      }
    }))
  }

  const handleWeightChange = (layerType, weight) => {
    setFormData(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [layerType]: parseInt(weight) || 1
      }
    }))
  }

  const handleLockChange = (layerType, locked) => {
    setFormData(prev => ({
      ...prev,
      locks: {
        ...prev.locks,
        [layerType]: locked
      }
    }))
  }

  const generatePreview = async () => {
    // Create a temporary stack for preview
    const tempStack = {
      id: 'preview',
      ...formData
    }

    try {
      const response = await fetch('http://localhost:8000/api/stacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempStack)
      })

      if (response.ok) {
        const data = await response.json()
        const stackId = data.stack.id

        // Get compiled preview
        const previewResponse = await fetch(`http://localhost:8000/api/stacks/${stackId}/compile`)
        const previewData = await previewResponse.json()
        
        setCompiledPreview(previewData)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Stack name is required')
      return
    }

    if (Object.keys(formData.prompts).length === 0) {
      alert('At least one prompt must be selected')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('http://localhost:8000/api/stacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail || 'Failed to save stack'}`)
      }
    } catch (error) {
      console.error('Error saving stack:', error)
      alert('Failed to save stack. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getPromptsForLayer = (layerType) => {
    return prompts.filter(p => p.layer_type === layerType)
  }

  const getSelectedPrompt = (layerType) => {
    const promptId = formData.prompts[layerType]
    return prompts.find(p => p.id === promptId)
  }

  const getLayerBadgeClass = (layerType) => {
    return `layer-badge layer-${layerType}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? `Edit Stack: ${stack.name}` : 'Create New Stack'}
            </h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stack Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field"
                placeholder="e.g., Customer Service Agent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="input-field"
                placeholder="Brief description of this stack's purpose"
              />
            </div>
          </div>

          {/* Layer Configuration */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Prompt Layer Configuration</h4>
            <div className="space-y-4">
              {layerTypes.map((layer) => {
                const layerPrompts = getPromptsForLayer(layer.name)
                const selectedPrompt = getSelectedPrompt(layer.name)
                
                return (
                  <div key={layer.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={getLayerBadgeClass(layer.name)}>
                          {layer.name}
                        </span>
                        <span className="text-sm text-gray-600">{layer.description}</span>
                        {layer.required && (
                          <span className="text-xs text-red-600 font-medium">Required</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {layerPrompts.length} available
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Prompt Selection */}
                      <div className="md:col-span-2">
                        <select
                          value={formData.prompts[layer.name] || ''}
                          onChange={(e) => handlePromptSelect(layer.name, e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select prompt...</option>
                          {layerPrompts.map((prompt) => (
                            <option key={prompt.id} value={prompt.id}>
                              {prompt.name} (v{prompt.version})
                            </option>
                          ))}
                        </select>
                        {selectedPrompt && (
                          <div className="mt-2 text-xs text-gray-600">
                            {selectedPrompt.description}
                          </div>
                        )}
                      </div>

                      {/* Weight and Lock */}
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Weight</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={formData.weights[layer.name] || 1}
                            onChange={(e) => handleWeightChange(layer.name, e.target.value)}
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="flex items-center pt-6">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.locks[layer.name] || false}
                              onChange={(e) => handleLockChange(layer.name, e.target.checked)}
                              className="rounded border-gray-300 text-okpo-600 focus:ring-okpo-500"
                            />
                            <span className="ml-2 text-xs text-gray-600">Lock</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
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
              disabled={saving || Object.keys(formData.prompts).length === 0}
            >
              {saving ? 'Saving...' : (isEdit ? 'Update Stack' : 'Create Stack')}
            </button>
          </div>
        </form>
      </div>

      {/* Compiled Preview */}
      {compiledPreview && (
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4">Compiled Preview</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">
              {compiledPreview.total_sections} sections • Generated: {new Date().toLocaleTimeString()}
            </div>
            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {compiledPreview.compiled_text}
            </pre>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Section Details:</h5>
            {compiledPreview.compiled_sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span className={getLayerBadgeClass(section.layer)}>
                    {section.layer}
                  </span>
                  <span className="text-gray-900">{section.prompt_name}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Weight: {section.weight}</span>
                  {section.locked && <span className="text-red-600">🔒</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}