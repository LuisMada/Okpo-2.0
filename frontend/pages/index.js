import { useState, useEffect } from 'react'
import PromptEditor from '../components/PromptEditor'
import PromptList from '../components/PromptList'
import StackComposer from '../components/StackComposer'
import StackList from '../components/StackList'

export default function Home() {
  const [activeTab, setActiveTab] = useState('prompts')
  const [prompts, setPrompts] = useState([])
  const [stacks, setStacks] = useState([])
  const [layerTypes, setLayerTypes] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Layout state
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [selectedStack, setSelectedStack] = useState(null)

  // Load sidebar preference from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('okpo-sidebar-visible')
    if (savedSidebarState !== null) {
      setSidebarVisible(JSON.parse(savedSidebarState))
    }
  }, [])

  // Save sidebar preference to localStorage
  useEffect(() => {
    localStorage.setItem('okpo-sidebar-visible', JSON.stringify(sidebarVisible))
  }, [sidebarVisible])

  // Fetch data from API
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [promptsRes, stacksRes, layersRes] = await Promise.all([
        fetch('http://localhost:8000/api/prompts'),
        fetch('http://localhost:8000/api/stacks'),
        fetch('http://localhost:8000/api/layer-types')
      ])

      const promptsData = await promptsRes.json()
      const stacksData = await stacksRes.json()
      const layersData = await layersRes.json()

      setPrompts(promptsData.prompts || [])
      setStacks(stacksData.stacks || [])
      setLayerTypes(layersData.layer_types || [])
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePromptSaved = () => {
    fetchData() // Refresh data
    setSelectedPrompt(null)
  }

  const handleStackSaved = () => {
    fetchData() // Refresh data
    setSelectedStack(null)
  }

  const handleNewItem = () => {
    if (activeTab === 'prompts') {
      setSelectedPrompt({})
      setSelectedStack(null)
    } else {
      setSelectedStack({})
      setSelectedPrompt(null)
    }
  }

  const handleCloseEditor = () => {
    setSelectedPrompt(null)
    setSelectedStack(null)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedPrompt(null)
    setSelectedStack(null)
  }

  // Determine if right panel should be shown
  const showRightPanel = selectedPrompt || selectedStack
  
  // Determine grid classes based on panel state
  const getGridClasses = () => {
    if (showRightPanel) {
      return 'grid grid-cols-1 xl:grid-cols-2 gap-8 h-full transition-all duration-300 ease-out'
    }
    return 'flex flex-col h-full transition-all duration-300 ease-out'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-okpo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OkPo Prompt Compiler...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Collapsible Sidebar Navigation */}
      <div className={`${sidebarVisible ? 'w-80' : 'w-16'} bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300 ease-out relative`}>
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10 group"
          title={sidebarVisible ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg 
            className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${sidebarVisible ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className={`p-6 border-b border-gray-200 ${!sidebarVisible && 'px-3'}`}>
          <div className={`flex items-center ${sidebarVisible ? 'space-x-3' : 'justify-center'}`}>
            <div className="bg-gradient-to-br from-okpo-500 to-okpo-600 rounded-xl p-3 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {sidebarVisible && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OkPo</h1>
                <p className="text-sm text-gray-600">Prompt Compiler</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 flex flex-col">
          <nav className={`p-4 space-y-2 ${!sidebarVisible && 'px-2'}`}>
            <button
              onClick={() => handleTabChange('prompts')}
              className={`w-full flex items-center ${sidebarVisible ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-left transition-all duration-200 relative group ${
                activeTab === 'prompts'
                  ? 'bg-gradient-to-r from-okpo-500 to-okpo-600 text-white shadow-lg shadow-okpo-500/25'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={!sidebarVisible ? 'Prompt Blocks' : ''}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {sidebarVisible && (
                <>
                  <div className="flex-1">
                    <div className="font-semibold">Prompt Blocks</div>
                    <div className="text-xs opacity-75">Create and manage modular prompt logic</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === 'prompts' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {prompts.length}
                  </div>
                </>
              )}
              {!sidebarVisible && (
                <div className={`absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${
                  activeTab === 'prompts' ? 'hidden' : ''
                }`}>
                  Prompt Blocks ({prompts.length})
                </div>
              )}
            </button>

            <button
              onClick={() => handleTabChange('stacks')}
              className={`w-full flex items-center ${sidebarVisible ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-left transition-all duration-200 relative group ${
                activeTab === 'stacks'
                  ? 'bg-gradient-to-r from-okpo-500 to-okpo-600 text-white shadow-lg shadow-okpo-500/25'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={!sidebarVisible ? 'Prompt Stacks' : ''}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {sidebarVisible && (
                <>
                  <div className="flex-1">
                    <div className="font-semibold">Prompt Stacks</div>
                    <div className="text-xs opacity-75">Assemble prompts into executable bundles</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === 'stacks' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stacks.length}
                  </div>
                </>
              )}
              {!sidebarVisible && (
                <div className={`absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${
                  activeTab === 'stacks' ? 'hidden' : ''
                }`}>
                  Prompt Stacks ({stacks.length})
                </div>
              )}
            </button>
          </nav>

          {/* Stats Section */}
          {sidebarVisible && (
            <div className="mt-auto p-4 border-t border-gray-200">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Total Prompts</span>
                    <span className="text-sm font-semibold text-gray-900">{prompts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Total Stacks</span>
                    <span className="text-sm font-semibold text-gray-900">{stacks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Layer Types</span>
                    <span className="text-sm font-semibold text-gray-900">{layerTypes.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'prompts' ? 'Prompt Blocks' : 'Prompt Stacks'}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'prompts' 
                  ? 'Create and manage modular prompt components'
                  : 'Assemble prompts into executable workflows'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Close Editor Button (only show when editor is open) */}
              {showRightPanel && (
                <button
                  onClick={handleCloseEditor}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Close</span>
                </button>
              )}
              
              {/* New Item Button */}
              <button
                onClick={handleNewItem}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>
                  {activeTab === 'prompts' ? 'New Prompt' : 'New Stack'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 p-8">
          {activeTab === 'prompts' && (
            <div className={getGridClasses()}>
              {/* Left Column - List (full width when no editor) */}
              <div className={`flex flex-col ${showRightPanel ? '' : 'w-full'}`}>
                <PromptList
                  prompts={prompts}
                  layerTypes={layerTypes}
                  onEdit={(prompt) => {
                    setSelectedPrompt(prompt)
                    setSelectedStack(null)
                  }}
                  onRefresh={fetchData}
                />
              </div>
              
              {/* Right Column - Editor (only show when needed) */}
              {showRightPanel && selectedPrompt && (
                <div className="flex flex-col animate-fade-in">
                  <PromptEditor
                    prompt={selectedPrompt}
                    layerTypes={layerTypes}
                    onSave={handlePromptSaved}
                    onCancel={handleCloseEditor}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'stacks' && (
            <div className={getGridClasses()}>
              {/* Left Column - List (full width when no composer) */}
              <div className={`flex flex-col ${showRightPanel ? '' : 'w-full'}`}>
                <StackList
                  stacks={stacks}
                  onEdit={(stack) => {
                    setSelectedStack(stack)
                    setSelectedPrompt(null)
                  }}
                  onRefresh={fetchData}
                />
              </div>
              
              {/* Right Column - Composer (only show when needed) */}
              {showRightPanel && selectedStack && (
                <div className="flex flex-col animate-fade-in">
                  <StackComposer
                    stack={selectedStack}
                    prompts={prompts}
                    layerTypes={layerTypes}
                    onSave={handleStackSaved}
                    onCancel={handleCloseEditor}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}