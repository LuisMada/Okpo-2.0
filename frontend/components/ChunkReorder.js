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
    <div className="mt-6 border-t border-gray-200/50 pt-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-gradient-to-br from-okpo-100 to-okpo-50 rounded-lg p-2">
          <svg className="w-5 h-5 text-okpo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
        <div className="flex-1">
          <h5 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
            <span className={getLayerBadgeClass(layerType)}>
              {layerType}
            </span>
            <span>Reorder Blocks ({chunks.length} blocks)</span>
          </h5>
          <p className="text-xs text-gray-500 mt-1">Drag blocks or use arrow buttons to reorder</p>
        </div>
      </div>
      
      <div className="space-y-3">
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
              className={`chunk-block cursor-move transition-all duration-200 ${
                draggedItem?.chunkId === chunkId 
                  ? 'ring-2 ring-okpo-400 shadow-xl transform scale-105' 
                  : 'hover:shadow-lg hover:ring-1 hover:ring-okpo-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="drag-handle">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                    <div className="w-7 h-7 bg-gradient-to-br from-okpo-500 to-okpo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      Block {index + 1}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-gray-700 bg-white/80 rounded-lg p-3 border border-gray-200/50 max-h-24 overflow-y-auto">
                    {chunk.content}
                  </div>
                </div>
                
                {/* Enhanced Move Controls */}
                <div className="flex flex-col space-y-1 ml-4">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                      index === 0 
                        ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                        : 'text-gray-600 hover:text-okpo-600 hover:bg-okpo-50 bg-white shadow-sm hover:shadow-md'
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
                    className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                      index === chunkOrder.length - 1 
                        ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                        : 'text-gray-600 hover:text-okpo-600 hover:bg-okpo-50 bg-white shadow-sm hover:shadow-md'
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
      
      <div className="flex items-center space-x-2 mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-xs text-blue-700">
          <span className="font-medium">Pro tip:</span> Drag blocks to reorder them, or use the arrow buttons. Changes apply to the compiled output instantly.
        </div>
      </div>
    </div>
  )
}