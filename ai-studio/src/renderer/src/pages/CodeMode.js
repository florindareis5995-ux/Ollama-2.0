import React, { useState } from 'react';
import { Code2, Play, Save, Download, Sparkles } from 'lucide-react';

const CodeMode = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('// Your generated code will appear here...\n');
  const [selectedEngine, setSelectedEngine] = useState('codellama');
  const [language, setLanguage] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);

  const engines = [
    { id: 'codellama', name: 'Code Llama' },
    { id: 'claude', name: 'Claude Code' },
    { id: 'openai', name: 'OpenAI Codex' },
    { id: 'opencode', name: 'OpenCode' },
    { id: 'ollama', name: 'Ollama (Any Model)' }
  ];

  const languages = ['javascript', 'python', 'typescript', 'rust', 'go', 'java', 'cpp'];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Mock generation - in real app, call AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockCode = `// Generated with ${selectedEngine}
// Language: ${language}

${language === 'python' ? `def main():
    """
    ${prompt}
    """
    print("Hello from generated code!")
    
if __name__ == "__main__":
    main()` : `/**
 * ${prompt}
 */
function main() {
  console.log('Hello from generated code!');
}

export default main;`}`;
      
      setGeneratedCode(mockCode);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const handleSave = () => {
    // In real app, open save dialog
    console.log('Saving file...');
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* Left Panel - Input */}
      <div className="w-1/3 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-slate-700 px-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Code2 size={20} />
            Code Mode
          </h2>
        </div>

        {/* Settings */}
        <div className="p-4 border-b border-slate-700 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">AI Engine</label>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {engines.map(engine => (
                <option key={engine.id} value={engine.id}>{engine.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="flex-1 p-4 flex flex-col">
          <label className="block text-sm text-slate-400 mb-2">
            Describe what you want to build
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Create a REST API endpoint that fetches user data from a database..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
          
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel - Output */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-slate-700 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Output:</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
              {language}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors flex items-center gap-1"
            >
              <Download size={14} />
              Copy
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
            >
              <Save size={14} />
              Save
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="code-block text-sm leading-relaxed">
            <code>{generatedCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeMode;
