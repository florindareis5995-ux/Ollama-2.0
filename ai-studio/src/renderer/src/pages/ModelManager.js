import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, RefreshCw, Play, HardDrive, Calendar } from 'lucide-react';

const ModelManager = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pullingModel, setPullingModel] = useState(null);
  const [modelName, setModelName] = useState('');

  // Mock data for development
  const mockModels = [
    { name: 'llama2', size: '3.8 GB', family: 'LLaMA', parameters: '7B', modifiedAt: '2024-01-15' },
    { name: 'mistral', size: '4.1 GB', family: 'Mistral', parameters: '7B', modifiedAt: '2024-01-14' },
    { name: 'codellama', size: '3.8 GB', family: 'Code Llama', parameters: '7B', modifiedAt: '2024-01-13' },
    { name: 'phi', size: '1.7 GB', family: 'Phi', parameters: '2B', modifiedAt: '2024-01-12' },
  ];

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.getOllamaModels();
        setModels(result);
      } else {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setModels(mockModels);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    if (!modelName.trim()) return;
    
    setPullingModel(modelName);
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.pullOllamaModel(modelName);
      } else {
        // Mock pull
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      setModelName('');
      loadModels();
    } catch (error) {
      console.error('Failed to pull model:', error);
    } finally {
      setPullingModel(null);
    }
  };

  const handleRemove = async (model) => {
    if (!confirm(`Are you sure you want to remove ${model}?`)) return;
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.removeOllamaModel(model);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      loadModels();
    } catch (error) {
      console.error('Failed to remove model:', error);
    }
  };

  const handleRun = (model) => {
    console.log(`Running model: ${model}`);
    // In real app, open terminal with ollama run command
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-14 border-b border-slate-700 px-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database size={20} />
          Model Manager
        </h2>
        <button
          onClick={loadModels}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Pull Model Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex gap-4 max-w-2xl">
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Enter model name (e.g., llama2, mistral, codellama)"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handlePull()}
          />
          <button
            onClick={handlePull}
            disabled={!modelName.trim() || pullingModel}
            className="px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors flex items-center gap-2"
          >
            {pullingModel === modelName ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Pulling...
              </>
            ) : (
              <>
                <Download size={18} />
                Pull Model
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="text-sm text-slate-400">Popular:</span>
          {['llama2', 'mistral', 'codellama', 'phi', 'gemma', 'neural-chat'].map(name => (
            <button
              key={name}
              onClick={() => setModelName(name)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Models List */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12">
            <Database className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No models installed</h3>
            <p className="text-slate-500">Pull a model to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {models.map((model, idx) => (
              <div
                key={idx}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Database size={24} className="text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white">{model.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <HardDrive size={14} />
                          {model.size}
                        </span>
                        <span>{model.family}</span>
                        <span>{model.parameters}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {model.modifiedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRun(model.name)}
                      className="p-2 hover:bg-green-600/20 text-green-500 rounded-lg transition-colors"
                      title="Run Model"
                    >
                      <Play size={18} />
                    </button>
                    <button
                      onClick={() => handleRemove(model.name)}
                      className="p-2 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
                      title="Remove Model"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelManager;
