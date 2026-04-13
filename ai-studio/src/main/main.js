const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Import backend services
const dependencyChecker = require('../backend/services/dependencyChecker');
const ollamaService = require('../backend/services/ollamaService');
const terminalService = require('../backend/services/terminalService');
const projectService = require('../backend/services/projectService');

let mainWindow;
let backendServer;

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#0f172a',
    titleBarStyle: 'hiddenInset',
    show: false
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (backendServer) {
      backendServer.close();
    }
  });
}

async function startBackendServer() {
  const serverApp = express();
  const PORT = 3456;

  serverApp.use(cors());
  serverApp.use(express.json());

  // Dependency Checker API
  serverApp.get('/api/dependencies/check', async (req, res) => {
    try {
      const result = await dependencyChecker.checkAll();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  serverApp.post('/api/dependencies/install/:name', async (req, res) => {
    try {
      const { name } = req.params;
      const result = await dependencyChecker.install(name);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Ollama Models API
  serverApp.get('/api/ollama/models', async (req, res) => {
    try {
      const models = await ollamaService.listModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  serverApp.post('/api/ollama/models/pull', async (req, res) => {
    try {
      const { model } = req.body;
      const result = await ollamaService.pullModel(model);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  serverApp.delete('/api/ollama/models/:model', async (req, res) => {
    try {
      const { model } = req.params;
      const result = await ollamaService.removeModel(model);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  serverApp.post('/api/ollama/chat', async (req, res) => {
    try {
      const { model, messages, stream } = req.body;
      
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        await ollamaService.chatStream(model, messages, (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        });
        res.end();
      } else {
        const result = await ollamaService.chat(model, messages);
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Terminal API
  serverApp.post('/api/terminal/execute', async (req, res) => {
    try {
      const { command, cwd } = req.body;
      const result = await terminalService.execute(command, cwd);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Project API
  serverApp.get('/api/projects', async (req, res) => {
    try {
      const projects = projectService.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  serverApp.post('/api/projects/create', async (req, res) => {
    try {
      const { name, type, path: projectPath } = req.body;
      const result = await projectService.createProject(name, type, projectPath);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  serverApp.post('/api/projects/open', async (req, res) => {
    try {
      const { path: projectPath } = req.body;
      const result = await projectService.openProject(projectPath);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return new Promise((resolve, reject) => {
    backendServer = serverApp.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
      resolve(backendServer);
    }).on('error', reject);
  });
}

// IPC Handlers
ipcMain.handle('check-dependencies', async () => {
  return await dependencyChecker.checkAll();
});

ipcMain.handle('install-dependency', async (event, name) => {
  return await dependencyChecker.install(name);
});

ipcMain.handle('get-ollama-models', async () => {
  return await ollamaService.listModels();
});

ipcMain.handle('pull-ollama-model', async (event, model) => {
  return await ollamaService.pullModel(model);
});

ipcMain.handle('remove-ollama-model', async (event, model) => {
  return await ollamaService.removeModel(model);
});

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result;
});

ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

app.whenReady().then(async () => {
  await startBackendServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
