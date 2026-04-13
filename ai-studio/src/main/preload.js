const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Dependency Checker
  checkDependencies: () => ipcRenderer.invoke('check-dependencies'),
  installDependency: (name) => ipcRenderer.invoke('install-dependency', name),
  
  // Ollama Models
  getOllamaModels: () => ipcRenderer.invoke('get-ollama-models'),
  pullOllamaModel: (model) => ipcRenderer.invoke('pull-ollama-model', model),
  removeOllamaModel: (model) => ipcRenderer.invoke('remove-ollama-model', model),
  
  // Dialogs
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  
  // Platform
  platform: process.platform,
  
  // Send messages to main process
  send: (channel, data) => {
    const validChannels = ['terminal-input', 'chat-message'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Receive messages from main process
  receive: (channel, func) => {
    const validChannels = ['terminal-output', 'chat-response', 'model-progress'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
