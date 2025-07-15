import { useState } from 'react'

export default function PromptList({ prompts, layerTypes, onEdit, onRefresh }) {
  const [filterLayer, setFilterLayer] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPrompts = prompts.filter(prompt => {
    const matchesLayer = filterLayer === 'all' || prompt.layer_type === filterLayer
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesLayer && matchesSearch
  })

  const getLayerBadgeClass = (layerType) => {
    return `layer-badge layer-${layerType}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewVersions = async (promptId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/prompts/${promptId}/versions`)
      const data = await response.json()
      
      if (response.ok) {
        // Store versions in localStorage for viewing
        localStorage.setItem('promptVersions', JSON.stringify(data.versions))
        alert(`Found ${data.versions.length} versions. Check console for details.`)
        console.log('Prompt Versions:', data.versions)
      }
    } catch (error) {
      console.error('Error fetching versions:', error)
    }
  }

  const handleDeletePrompt = async (prompt) => {
    if (!confirm(`Are you sure you want to delete "${prompt.name}"?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/prompts/${prompt.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        onRefresh() // Refresh the prompt list
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail}`)
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
      alert('Failed to delete prompt. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterLayer}
              onChange={(e) => setFilterLayer(e.target.value)}
              className="input-field"
            >
              <option value="all">All Layers</option>
              {layerTypes.map((layer) => (
                <option key={layer.name} value={layer.name}>
                  {layer.name.charAt(0).toUpperCase() + layer.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Prompt Cards */}
      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              {prompts.length === 0 ? (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {prompts.length === 0 ? 'No prompts created yet' : 'No prompts match your filters'}
            </h3>
            <p className="text-gray-600">
              {prompts.length === 0 
                ? 'Create your first prompt to get started' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="card-container"
            >
              {/* Card Header with Actions */}
              <div className="card-header">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg">{prompt.name}</h4>
                    <span className={getLayerBadgeClass(prompt.layer_type)}>
                      {prompt.layer_type}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      v{prompt.version}
                    </span>
                  </div>
                  
                  {prompt.description && (
                    <p className="text-gray-600 mb-4 text-sm">{prompt.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Created: {formatDate(prompt.created_at)} by {prompt.author}</span>
                    </div>
                    {prompt.change_comment && (
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="italic">"{prompt.change_comment}"</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex px-3 py-1 text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-full border border-gray-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Actions */}
                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => onEdit(prompt)}
                    className="btn-primary text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleViewVersions(prompt.id)}
                    className="btn-secondary text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Versions</span>
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt)}
                    className="btn-danger text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Content Preview */}
              <div className="card-content">
                <div className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">Content Preview</span>
                  </div>
                  <div className="text-xs font-mono text-gray-700 bg-white/70 rounded-lg p-3 border border-gray-100">
                    {prompt.content.length > 200 
                      ? prompt.content.substring(0, 200) + '...'
                      : prompt.content
                    }
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Summary */}
      {filteredPrompts.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Showing <strong>{filteredPrompts.length}</strong> of <strong>{prompts.length}</strong> prompts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}