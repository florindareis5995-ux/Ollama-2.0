# AI Studio

A beautiful, modern desktop application that replaces the ugly terminal workflow of Ollama and local AI tools with a user-friendly interface.

## Features

### 1. Dependency Manager
- Automatically detects installed dependencies (Ollama, Node.js, Python, Git)
- One-click installation for missing dependencies
- Platform-specific install commands (macOS, Windows, Linux)

### 2. Model Manager (Ollama)
- List all installed local models with size, version, and status
- Install, remove, update, and run models
- Progress tracking for model downloads

### 3. Chat Mode
- Beautiful AI chat interface with markdown support
- Streaming responses
- Switch between local models (Ollama) and cloud models
- Chat history

### 4. Code Mode
- Code generation with multiple AI engines
- Support for Claude Code, OpenAI Codex, OpenCode, and Ollama models
- Multiple programming languages
- Export code directly to files

### 5. Integrated Terminal
- Styled terminal window with color output
- Command history
- Run Ollama commands internally
- Safe system command execution

### 6. Project Manager
- Create new projects (Node, Python, React, Godot, etc.)
- Open existing folders
- Project structure visualization
- AI-assisted file generation and modification

## Architecture

```
ai-studio/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.js     # Main entry point
│   │   └── preload.js  # Preload script
│   ├── backend/        # Backend services
│   │   ├── api/        # API routes
│   │   ├── services/   # Core services
│   │   │   ├── dependencyChecker.js
│   │   │   ├── ollamaService.js
│   │   │   ├── terminalService.js
│   │   │   └── projectService.js
│   │   └── utils/      # Utilities
│   └── renderer/       # React frontend
│       ├── public/
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── store/
│           └── utils/
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

This will:
- Start the React development server on port 3000
- Launch Electron once the React app is ready

### Production Build

```bash
npm run build
```

This creates:
- Optimized React build in `build/`
- Packaged Electron app in `dist/`

## Usage

### Checking Dependencies
The app automatically checks for required dependencies on startup. If any are missing, a modal will appear with one-click install buttons.

### Managing Models
1. Navigate to the "Models" tab
2. Enter a model name (e.g., `llama2`, `mistral`, `codellama`)
3. Click "Pull Model" to download
4. Use the play button to run a model
5. Use the trash button to remove a model

### Chat Mode
1. Select a model from the dropdown
2. Type your message
3. Press Enter or click Send
4. Responses stream in real-time

### Code Mode
1. Select an AI engine (Code Llama, Claude, etc.)
2. Choose a programming language
3. Describe what you want to build
4. Click "Generate Code"
5. Copy or save the generated code

### Project Management
1. Click "+" to create a new project
2. Choose project type (Node, Python, React, etc.)
3. Enter a project name
4. Projects are stored in `~/AIStudio/Projects`

## Configuration

### Environment Variables

Create a `.env` file for API keys:

```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Roadmap

### v1.1
- [ ] Real-time terminal with node-pty
- [ ] Syntax highlighting in code editor
- [ ] File tree navigation
- [ ] Markdown preview

### v1.2
- [ ] Cloud model integration (OpenAI, Anthropic, Google)
- [ ] Model comparison mode
- [ ] Custom model configurations

### v1.3
- [ ] Plugin system
- [ ] Theme customization
- [ ] Keyboard shortcuts
- [ ] Settings panel

### v2.0
- [ ] Multi-model conversations
- [ ] Voice input/output
- [ ] Image generation support
- [ ] Collaborative features

## Tech Stack

- **Frontend**: React 18, TailwindCSS, Lucide Icons
- **Desktop**: Electron 28
- **Backend**: Node.js, Express
- **AI Integration**: Ollama API, OpenAI SDK, Anthropic SDK
- **State Management**: Zustand (planned)

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please open an issue on GitHub.
