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
      return (
        <div className="mt-6 border-t border-gray-200/50 pt-6">
          <div className="flex items-center space-x-3">
            <div className="loading-spinner w-5 h-5"></div>
            <span className="text-sm text-gray-500">Loading preview...</span>
          </div>
        </div>
      )
    }

    if (!compiled) {
      return (
        <div className="mt-6 border-t border-gray-200/50 pt-6">
          <div className="flex items-center space-x-3 text-red-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Failed to load preview</span>
          </div>
        </div>
      )
    }

    return (
      <div className="mt-6 border-t border-gray-200/50 pt-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-700">
              Compiled Preview ({compiled.total_sections} sections)
            </h5>
            <p className="text-xs text-gray-500">Ready for deployment</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {compiled.compiled_sections.map((section, index) => (
            <div key={index} className="chunk-block">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-okpo-500 to-okpo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className={getLayerBadgeClass(section.layer)}>
                    {section.layer}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {section.prompt_name}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Weight: {section.weight}</span>
                  </div>
                  {section.locked && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-xs font-mono text-gray-700 bg-white/80 rounded-lg p-3 border border-gray-200/50 max-h-24 overflow-y-auto">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h6 className="text-sm font-semibold text-blue-900">Final Compiled Output</h6>
          </div>
          <pre className="text-xs font-mono text-blue-800 whitespace-pre-wrap max-h-32 overflow-y-auto bg-white/50 rounded-lg p-3 border border-blue-200/30">
            {compiled.compiled_text}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search */}
      <div className="card p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search stacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Stack Cards */}
      <div className="space-y-4">
        {filteredStacks.length === 0 ? (
          <div className="card text-center py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              {stacks.length === 0 ? (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {stacks.length === 0 ? 'No stacks created yet' : 'No stacks match your search'}
            </h3>
            <p className="text-gray-600">
              {stacks.length === 0 
                ? 'Create your first stack to get started' 
                : 'Try adjusting your search criteria'
              }
            </p>
          </div>
        ) : (
          filteredStacks.map((stack) => (
            <div
              key={stack.id}
              className="card card-hover"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg">{stack.name}</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200/50">
                      {Object.keys(stack.prompts).length} layers
                    </span>
                  </div>
                  
                  {stack.description && (
                    <p className="text-gray-600 mb-4 text-sm">{stack.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Created: {formatDate(stack.created_at)} by {stack.author}</span>
                  </div>

                  {/* Enhanced Layer Summary */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.keys(stack.prompts).map((layerType) => (
                      <div key={layerType} className={`${getLayerBadgeClass(layerType)} flex items-center space-x-1`}>
                        <span>{layerType}</span>
                        {stack.weights[layerType] && stack.weights[layerType] !== 1 && (
                          <span className="text-xs opacity-75">({stack.weights[layerType]})</span>
                        )}
                        {stack.locks[layerType] && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Expanded Preview */}
                  {expandedStack === stack.id && (
                    <CompilerPreview stackId={stack.id} />
                  )}
                </div>

                {/* Enhanced Actions */}
                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => onEdit(stack)}
                    className="btn-primary text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleViewCompiled(stack.id)}
                    className="btn-secondary text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{expandedStack === stack.id ? 'Hide' : 'Preview'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteStack(stack)}
                    className="btn-danger text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Summary */}
      {filteredStacks.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Showing <strong>{filteredStacks.length}</strong> of <strong>{stacks.length}</strong> stacks</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}