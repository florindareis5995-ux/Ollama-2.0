import React, { useState } from 'react';
import { X, Download, AlertTriangle, CheckCircle } from 'lucide-react';

const DependencyChecker = ({ onClose, onComplete }) => {
  const [installing, setInstalling] = useState(null);
  const [installResults, setInstallResults] = useState({});
  
  const mockDependencies = {
    ollama: { name: 'Ollama', installed: false, description: 'Local AI model runner' },
    node: { name: 'Node.js', installed: true, version: 'v20.10.0', description: 'JavaScript runtime' },
    python: { name: 'Python', installed: true, version: '3.11.6', description: 'Python interpreter' },
    git: { name: 'Git', installed: false, description: 'Version control system' }
  };

  const dependencies = mockDependencies; // In real app, use actual data
  const missing = Object.entries(dependencies).filter(([_, dep]) => !dep.installed);

  const handleInstall = async (key) => {
    setInstalling(key);
    
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.installDependency(key);
        setInstallResults(prev => ({ ...prev, [key]: result }));
      } else {
        // Mock installation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setInstallResults(prev => ({ 
          ...prev, 
          [key]: { success: true, message: `${dependencies[key].name} installed successfully (mock)` } 
        }));
      }
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      setInstallResults(prev => ({ 
        ...prev, 
        [key]: { success: false, error: error.message } 
      }));
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-500" size={24} />
            <h2 className="text-xl font-semibold text-white">Missing Dependencies</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-400 mb-6">
            The following dependencies are required but not installed on your system.
            Click install to automatically set them up.
          </p>

          <div className="space-y-4">
            {missing.map(([key, dep]) => {
              const result = installResults[key];
              
              return (
                <div
                  key={key}
                  className="bg-slate-900 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{dep.name}</h3>
                      <p className="text-sm text-slate-400">{dep.description}</p>
                    </div>
                    
                    {result?.success ? (
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle size={20} />
                        <span className="text-sm">Installed</span>
                      </div>
                    ) : installing === key ? (
                      <div className="flex items-center gap-2 text-blue-500">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Installing...</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInstall(key)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Download size={16} />
                        Install
                      </button>
                    )}
                  </div>

                  {result && !result.success && (
                    <p className="mt-2 text-sm text-red-400">{result.error}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Already Installed */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Already Installed</h3>
            <div className="space-y-2">
              {Object.entries(dependencies)
                .filter(([_, dep]) => dep.installed)
                .map(([key, dep]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-slate-300">{dep.name}</span>
                    {dep.version && (
                      <span className="text-slate-500">({dep.version})</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default DependencyChecker;
