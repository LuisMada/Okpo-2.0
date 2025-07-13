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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
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

      {/* Prompt Cards */}
      <div className="space-y-3">
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {prompts.length === 0 ? 'No prompts created yet' : 'No prompts match your filters'}
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                    <span className={getLayerBadgeClass(prompt.layer_type)}>
                      {prompt.layer_type}
                    </span>
                    <span className="text-sm text-gray-500">v{prompt.version}</span>
                  </div>
                  
                  {prompt.description && (
                    <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <div>Created: {formatDate(prompt.created_at)} by {prompt.author}</div>
                    {prompt.change_comment && (
                      <div className="mt-1 italic">"{prompt.change_comment}"</div>
                    )}
                  </div>

                  {/* Tags */}
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content Preview */}
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <div className="text-xs font-mono text-gray-700 line-clamp-3">
                      {prompt.content.length > 150 
                        ? prompt.content.substring(0, 150) + '...'
                        : prompt.content
                      }
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => onEdit(prompt)}
                    className="btn-primary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewVersions(prompt.id)}
                    className="btn-secondary text-sm"
                  >
                    Versions
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredPrompts.length > 0 && (
        <div className="text-sm text-gray-500 text-center pt-4 border-t border-gray-200">
          Showing {filteredPrompts.length} of {prompts.length} prompts
        </div>
      )}
    </div>
  )
}