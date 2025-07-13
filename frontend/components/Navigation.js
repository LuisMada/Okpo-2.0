export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'prompts', name: 'Prompt Blocks', description: 'Create and manage modular prompt logic' },
    { id: 'stacks', name: 'Prompt Stacks', description: 'Assemble prompts into executable bundles' }
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-okpo-500 text-okpo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}