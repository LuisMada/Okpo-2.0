export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { 
      id: 'prompts', 
      name: 'Prompt Blocks', 
      description: 'Create and manage modular prompt logic',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'stacks', 
      name: 'Prompt Stacks', 
      description: 'Assemble prompts into executable bundles',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ]

  return (
    <nav className="bg-white/70 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${
                activeTab === tab.id
                  ? 'nav-tab-active'
                  : 'nav-tab-inactive'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${activeTab === tab.id ? 'text-okpo-600' : 'text-gray-400'} transition-colors duration-200`}>
                  {tab.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{tab.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">{tab.description}</div>
                </div>
              </div>
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-okpo-500 to-okpo-600 transform scale-x-100 transition-transform duration-200"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}