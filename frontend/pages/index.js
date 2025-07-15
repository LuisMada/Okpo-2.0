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
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [selectedStack, setSelectedStack] = useState(null)
  const [loading, setLoading] = useState(true)

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
      {/* Fixed Sidebar Navigation */}
      <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-okpo-500 to-okpo-600 rounded-xl p-3 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OkPo</h1>
              <p className="text-sm text-gray-600">Prompt Compiler</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 flex flex-col">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab('prompts')
                setSelectedPrompt(null)
                setSelectedStack(null)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === 'prompts'
                  ? 'bg-gradient-to-r from-okpo-500 to-okpo-600 text-white shadow-lg shadow-okpo-500/25'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
            </button>

            <button
              onClick={() => {
                setActiveTab('stacks')
                setSelectedPrompt(null)
                setSelectedStack(null)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === 'stacks'
                  ? 'bg-gradient-to-r from-okpo-500 to-okpo-600 text-white shadow-lg shadow-okpo-500/25'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
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
            </button>
          </nav>

          {/* Stats Section */}
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
            <button
              onClick={() => {
                if (activeTab === 'prompts') {
                  setSelectedPrompt({})
                  setSelectedStack(null)
                } else {
                  setSelectedStack({})
                  setSelectedPrompt(null)
                }
              }}
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

        {/* Main Content Grid */}
        <div className="flex-1 p-8">
          {activeTab === 'prompts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Left Column - List */}
              <div className="flex flex-col">
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
              
              {/* Right Column - Editor */}
              <div className="flex flex-col">
                {selectedPrompt ? (
                  <PromptEditor
                    prompt={selectedPrompt}
                    layerTypes={layerTypes}
                    onSave={handlePromptSaved}
                    onCancel={() => setSelectedPrompt(null)}
                  />
                ) : (
                  <div className="card h-full flex items-center justify-center text-center">
                    <div>
                      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a prompt to edit</h3>
                      <p className="text-gray-600">Choose a prompt from the list or create a new one to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stacks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Left Column - List */}
              <div className="flex flex-col">
                <StackList
                  stacks={stacks}
                  onEdit={(stack) => {
                    setSelectedStack(stack)
                    setSelectedPrompt(null)
                  }}
                  onRefresh={fetchData}
                />
              </div>
              
              {/* Right Column - Composer */}
              <div className="flex flex-col">
                {selectedStack ? (
                  <StackComposer
                    stack={selectedStack}
                    prompts={prompts}
                    layerTypes={layerTypes}
                    onSave={handleStackSaved}
                    onCancel={() => setSelectedStack(null)}
                  />
                ) : (
                  <div className="card h-full flex items-center justify-center text-center">
                    <div>
                      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a stack to edit</h3>
                      <p className="text-gray-600">Choose a stack from the list or create a new one to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}