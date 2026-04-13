import React, { useState } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';

const TerminalPanel = ({ onClose }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [history, setHistory] = useState([
    { type: 'output', content: 'AI Studio Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' },
    { type: 'output', content: '' },
  ]);
  const [input, setInput] = useState('');

  const handleCommand = async (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add command to history
    setHistory(prev => [...prev, { type: 'input', content: trimmedCmd }]);

    // Process command
    let output = '';
    
    switch (trimmedCmd.toLowerCase()) {
      case 'help':
        output = `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  ollama list   - List installed models
  ollama run    - Run a model
  version       - Show version info`;
        break;
      
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      
      case 'ollama list':
        output = `NAME            SIZE      MODIFIED
llama2          3.8 GB    2 days ago
mistral         4.1 GB    3 days ago
codellama       3.8 GB    4 days ago
phi             1.7 GB    5 days ago`;
        break;
      
      case 'version':
        output = 'AI Studio v1.0.0\nElectron v28.0.0\nNode v20.10.0';
        break;
      
      default:
        if (trimmedCmd.startsWith('ollama')) {
          output = `[Mock] Executing: ${trimmedCmd}\nIn the full application, this would run the actual Ollama command.`;
        } else {
          output = `Command not found: ${trimmedCmd}\nType "help" for available commands.`;
        }
    }

    // Add output to history
    await new Promise(resolve => setTimeout(resolve, 100));
    setHistory(prev => [...prev, { type: 'output', content: output }]);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <div className={`bg-slate-950 border-t border-slate-700 flex flex-col transition-all duration-300 ${
      isMaximized ? 'flex-1' : 'h-48'
    }`}>
      {/* Terminal Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400 font-mono">Terminal</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 hover:bg-slate-800 rounded transition-colors"
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-600/20 hover:text-red-500 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {history.map((line, idx) => (
          <div key={idx} className="mb-1">
            {line.type === 'input' ? (
              <div className="flex items-center gap-2 text-green-400">
                <span className="text-blue-400">➜</span>
                <span className="text-cyan-400">~</span>
                <span>{line.content}</span>
              </div>
            ) : (
              <div className="text-slate-300 whitespace-pre-wrap">{line.content}</div>
            )}
          </div>
        ))}
        
        {/* Input Line */}
        <div className="flex items-center gap-2 text-green-400 mt-2">
          <span className="text-blue-400">➜</span>
          <span className="text-cyan-400">~</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent border-none outline-none text-slate-100"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
