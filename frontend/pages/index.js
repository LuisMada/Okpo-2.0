import { useState, useEffect } from 'react'
import PromptEditor from '../components/PromptEditor'
import PromptList from '../components/PromptList'
import StackComposer from '../components/StackComposer'
import StackList from '../components/StackList'
import Navigation from '../components/Navigation'

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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-16 w-16 mx-auto mb-6"></div>
          <div className="glass-card p-8 max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading OkPo</h3>
            <p className="text-gray-600">Initializing Prompt Compiler...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="header-gradient shadow-lg border-b border-white/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-okpo-600 to-okpo-700 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-okpo-600 to-okpo-800 bg-clip-text text-transparent">
                  OkPo
                </h1>
                <p className="text-sm text-gray-600 font-medium">Prompt Compiler • Step 1</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="stats-badge">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  {prompts.length} prompts
                </div>
                <div className="stats-badge">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                  </svg>
                  {stacks.length} stacks
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prompts' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="section-header">Prompt Blocks</h2>
                  <p className="text-gray-600">Create and manage modular prompt components</p>
                </div>
                <button
                  onClick={() => setSelectedPrompt({})}
                  className="btn-primary flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Prompt</span>
                </button>
              </div>
              <PromptList
                prompts={prompts}
                layerTypes={layerTypes}
                onEdit={setSelectedPrompt}
                onRefresh={fetchData}
              />
            </div>
            <div className="space-y-6">
              {selectedPrompt ? (
                <PromptEditor
                  prompt={selectedPrompt}
                  layerTypes={layerTypes}
                  onSave={handlePromptSaved}
                  onCancel={() => setSelectedPrompt(null)}
                />
              ) : (
                <div className="card text-center py-12">
                  <div className="bg-gradient-to-br from-okpo-100 to-okpo-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-okpo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Prompt to Edit</h3>
                  <p className="text-gray-600">Choose an existing prompt or create a new one to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stacks' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="section-header">Prompt Stacks</h2>
                  <p className="text-gray-600">Assemble prompts into executable bundles</p>
                </div>
                <button
                  onClick={() => setSelectedStack({})}
                  className="btn-primary flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Stack</span>
                </button>
              </div>
              <StackList
                stacks={stacks}
                onEdit={setSelectedStack}
                onRefresh={fetchData}
              />
            </div>
            <div className="space-y-6">
              {selectedStack ? (
                <StackComposer
                  stack={selectedStack}
                  prompts={prompts}
                  layerTypes={layerTypes}
                  onSave={handleStackSaved}
                  onCancel={() => setSelectedStack(null)}
                />
              ) : (
                <div className="card text-center py-12">
                  <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Stack to Configure</h3>
                  <p className="text-gray-600">Choose an existing stack or create a new one to compose prompts</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}