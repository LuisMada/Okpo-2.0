import { useState } from 'react'

export default function ChunkReorder({ chunks, layerType, onOrderChange }) {
  const [chunkOrder, setChunkOrder] = useState(
    chunks.map(chunk => chunk.id)
  )
  const [draggedItem, setDraggedItem] = useState(null)

  const moveChunk = (fromIndex, toIndex) => {
    const newOrder = [...chunkOrder]
    const [movedItem] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedItem)
    
    setChunkOrder(newOrder)
    onOrderChange(layerType, newOrder)
  }

  const moveUp = (index) => {
    if (index > 0) {
      moveChunk(index, index - 1)
    }
  }

  const moveDown = (index) => {
    if (index < chunkOrder.length - 1) {
      moveChunk(index, index + 1)
    }
  }

  const handleDragStart = (e, chunkId, index) => {
    setDraggedItem({ chunkId, index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedItem(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedItem && draggedItem.index !== dropIndex) {
      moveChunk(draggedItem.index, dropIndex)
    }
    setDraggedItem(null)
  }

  const getChunkById = (chunkId) => {
    return chunks.find(chunk => chunk.id === chunkId)
  }

  const getLayerBadgeClass = (layerType) => {
    return `layer-badge layer-${layerType}`
  }

  if (!chunks || chunks.length <= 1) {
    return null // No reordering needed for single or no chunks
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <span className={getLayerBadgeClass(layerType)}>
          {layerType}
        </span>
        <span className="ml-2">Reorder Blocks ({chunks.length} blocks)</span>
      </h5>
      
      <div className="space-y-2">
        {chunkOrder.map((chunkId, index) => {
          const chunk = getChunkById(chunkId)
          if (!chunk) return null
          
          return (
            <div
              key={chunkId}
              draggable
              onDragStart={(e) => handleDragStart(e, chunkId, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-gray-50 rounded-lg p-3 border-2 cursor-move transition-all duration-200 ${
                draggedItem?.chunkId === chunkId 
                  ? 'border-okpo-400 shadow-lg' 
                  : 'border-gray-200 hover:border-okpo-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Block {index + 1}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-gray-700 bg-white rounded p-2 max-h-20 overflow-y-auto">
                    {chunk.content}
                  </div>
                </div>
                
                {/* Fallback Move Controls for mobile/accessibility */}
                <div className="flex flex-col space-y-1 ml-3">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={`p-1 rounded text-xs ${
                      index === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-okpo-600 hover:bg-okpo-50'
                    }`}
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === chunkOrder.length - 1}
                    className={`p-1 rounded text-xs ${
                      index === chunkOrder.length - 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-okpo-600 hover:bg-okpo-50'
                    }`}
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        <span className="font-medium">💡 Drag blocks to reorder</span> or use ↑ ↓ buttons. Changes apply to the compiled output.
      </div>
    </div>
  )
}