import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatMode from './pages/ChatMode';
import CodeMode from './pages/CodeMode';
import ModelManager from './pages/ModelManager';
import ProjectManager from './pages/ProjectManager';
import TerminalPanel from './components/TerminalPanel';
import DependencyChecker from './components/DependencyChecker';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showTerminal, setShowTerminal] = useState(true);
  const [dependencies, setDependencies] = useState(null);
  const [showDeps, setShowDeps] = useState(false);

  useEffect(() => {
    checkDependencies();
  }, []);

  const checkDependencies = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.checkDependencies();
        setDependencies(result);
        
        // Show dependency checker if something is missing
        if (!result.allInstalled) {
          setShowDeps(true);
        }
      } else {
        // Mock data for development without Electron
        setDependencies({
          allInstalled: false,
          missing: [
            { key: 'ollama', name: 'Ollama' }
          ]
        });
        setShowDeps(true);
      }
    } catch (error) {
      console.error('Failed to check dependencies:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatMode />;
      case 'code':
        return <CodeMode />;
      case 'models':
        return <ModelManager />;
      case 'projects':
        return <ProjectManager />;
      default:
        return <ChatMode />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-50">
      {/* Title Bar */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 drag-region">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm font-medium text-slate-400">AI Studio</div>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onCheckDeps={() => setShowDeps(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Area */}
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>

          {/* Terminal Panel */}
          {showTerminal && (
            <TerminalPanel onClose={() => setShowTerminal(false)} />
          )}
        </div>
      </div>

      {/* Dependency Checker Modal */}
      {showDeps && (
        <DependencyChecker 
          onClose={() => setShowDeps(false)}
          onComplete={checkDependencies}
        />
      )}
    </div>
  );
}

export default App;
