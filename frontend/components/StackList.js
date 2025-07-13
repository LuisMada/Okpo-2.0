import { useState, useEffect } from 'react'

export default function StackList({ stacks, onEdit, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedStack, setExpandedStack] = useState(null)

  const filteredStacks = stacks.filter(stack =>
    stack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stack.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLayerBadgeClass = (layerType) => {
    return `layer-badge layer-${layerType}`
  }

  const handleViewCompiled = async (stackId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/stacks/${stackId}/compile`)
      const data = await response.json()
      
      if (response.ok) {
        // Store compiled data for viewing
        localStorage.setItem('compiledStack', JSON.stringify(data))
        setExpandedStack(expandedStack === stackId ? null : stackId)
        console.log('Compiled Stack:', data)
      }
    } catch (error) {
      console.error('Error compiling stack:', error)
    }
  }

  const handleDeleteStack = async (stack) => {
    if (!confirm(`Are you sure you want to delete "${stack.name}"?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/stacks/${stack.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        onRefresh() // Refresh the stack list
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail}`)
      }
    } catch (error) {
      console.error('Error deleting stack:', error)
      alert('Failed to delete stack. Please try again.')
    }
  }

  const CompilerPreview = ({ stackId }) => {
    const [compiled, setCompiled] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchCompiled = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/stacks/${stackId}/compile`)
          const data = await response.json()
          setCompiled(data)
        } catch (error) {
          console.error('Error:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchCompiled()
    }, [stackId])

    if (loading) {
      return <div className="text-sm text-gray-500">Loading preview...</div>
    }

    if (!compiled) {
      return <div className="text-sm text-red-500">Failed to load preview</div>
    }

    return (
      <div className="mt-4 border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          Compiled Preview ({compiled.total_sections} sections)
        </h5>
        
        <div className="space-y-3">
          {compiled.compiled_sections.map((section, index) => (
            <div key={index} className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={getLayerBadgeClass(section.layer)}>
                    {section.layer}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {section.prompt_name}
                  </span>
                  {section.chunks && section.chunks.length > 1 && (
                    <span className="text-xs text-okpo-600">
                      ({section.chunks.length} blocks)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Weight: {section.weight}</span>
                  {section.locked && <span className="text-red-600">🔒</span>}
                </div>
              </div>
              
              {/* Show individual chunks if multiple blocks */}
              {section.chunks && section.chunks.length > 1 ? (
                <div className="space-y-2">
                  {section.chunks.map((chunk, chunkIndex) => (
                    <div key={chunk.id} className="bg-white rounded p-2 border-l-2 border-okpo-300">
                      <div className="text-xs font-medium text-okpo-600 mb-1">
                        Block {chunkIndex + 1}
                      </div>
                      <div className="text-xs font-mono text-gray-700 max-h-20 overflow-y-auto">
                        {section.content.split('\n\n')[chunkIndex] || section.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs font-mono text-gray-700 bg-white rounded p-2 max-h-24 overflow-y-auto">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 bg-blue-50 rounded p-3">
          <h6 className="text-sm font-medium text-blue-900 mb-2">Final Compiled Output:</h6>
          <pre className="text-xs font-mono text-blue-800 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {compiled.compiled_text}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search stacks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Stack Cards */}
      <div className="space-y-3">
        {filteredStacks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {stacks.length === 0 ? 'No stacks created yet' : 'No stacks match your search'}
          </div>
        ) : (
          filteredStacks.map((stack) => (
            <div
              key={stack.id}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{stack.name}</h4>
                    <span className="text-sm text-gray-500">
                      {Object.keys(stack.prompts).length} layers
                    </span>
                  </div>
                  
                  {stack.description && (
                    <p className="text-sm text-gray-600 mb-3">{stack.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Created: {formatDate(stack.created_at)} by {stack.author}
                  </div>

                  {/* Layer Summary */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.keys(stack.prompts).map((layerType) => (
                      <span key={layerType} className={getLayerBadgeClass(layerType)}>
                        {layerType}
                        {stack.weights[layerType] && (
                          <span className="ml-1 text-xs">({stack.weights[layerType]})</span>
                        )}
                        {stack.locks[layerType] && <span className="ml-1">🔒</span>}
                      </span>
                    ))}
                  </div>

                  {/* Expanded Preview */}
                  {expandedStack === stack.id && (
                    <CompilerPreview stackId={stack.id} />
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => onEdit(stack)}
                    className="btn-primary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewCompiled(stack.id)}
                    className="btn-secondary text-sm"
                  >
                    {expandedStack === stack.id ? 'Hide' : 'Preview'}
                  </button>
                  <button
                    onClick={() => handleDeleteStack(stack)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredStacks.length > 0 && (
        <div className="text-sm text-gray-500 text-center pt-4 border-t border-gray-200">
          Showing {filteredStacks.length} of {stacks.length} stacks
        </div>
      )}
    </div>
  )
}