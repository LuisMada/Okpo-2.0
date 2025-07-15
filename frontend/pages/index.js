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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-okpo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OkPo Prompt Compiler...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OkPo</h1>
              <p className="text-sm text-gray-600">Prompt Compiler - Step 1</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {prompts.length} prompts • {stacks.length} stacks
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Prompt Blocks</h2>
                <button
                  onClick={() => setSelectedPrompt({})}
                  className="btn-primary"
                >
                  New Prompt
                </button>
              </div>
              <PromptList
                prompts={prompts}
                layerTypes={layerTypes}
                onEdit={setSelectedPrompt}
                onRefresh={fetchData}
              />
            </div>
            <div>
              {selectedPrompt && (
                <PromptEditor
                  prompt={selectedPrompt}
                  layerTypes={layerTypes}
                  onSave={handlePromptSaved}
                  onCancel={() => setSelectedPrompt(null)}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'stacks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Prompt Stacks</h2>
                <button
                  onClick={() => setSelectedStack({})}
                  className="btn-primary"
                >
                  New Stack
                </button>
              </div>
              <StackList
                stacks={stacks}
                onEdit={setSelectedStack}
                onRefresh={fetchData}
              />
            </div>
            <div>
              {selectedStack && (
                <StackComposer
                  stack={selectedStack}
                  prompts={prompts}
                  layerTypes={layerTypes}
                  onSave={handleStackSaved}
                  onCancel={() => setSelectedStack(null)}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}