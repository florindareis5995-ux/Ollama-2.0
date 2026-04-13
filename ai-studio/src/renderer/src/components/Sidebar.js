import React from 'react';
import { MessageSquare, Code, Database, FolderOpen, Settings, Terminal } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onCheckDeps }) => {
  const tabs = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'code', icon: Code, label: 'Code' },
    { id: 'models', icon: Database, label: 'Models' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
  ];

  return (
    <div className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title={tab.label}
          >
            <tab.icon size={20} />
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <button
          onClick={onCheckDeps}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Check Dependencies"
        >
          <Settings size={20} />
        </button>
        <button
          className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Terminal"
        >
          <Terminal size={20} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
