const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ProjectService {
  constructor() {
    this.projectsDir = path.join(os.homedir(), 'AIStudio', 'Projects');
    this.projectsFile = path.join(this.projectsDir, 'projects.json');
    this.projects = [];
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.projectsDir, { recursive: true });
      const data = await fs.readFile(this.projectsFile, 'utf-8');
      this.projects = JSON.parse(data);
    } catch (error) {
      this.projects = [];
    }
  }

  async save() {
    await fs.writeFile(this.projectsFile, JSON.stringify(this.projects, null, 2));
  }

  getProjects() {
    return this.projects;
  }

  async createProject(name, type = 'node', projectPath = null) {
    const basePath = projectPath || path.join(this.projectsDir, name);
    
    // Create project directory
    await fs.mkdir(basePath, { recursive: true });

    // Generate project structure based on type
    await this.generateProjectStructure(basePath, type, name);

    const project = {
      id: `project_${Date.now()}`,
      name,
      type,
      path: basePath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects.push(project);
    await this.save();

    return project;
  }

  async generateProjectStructure(basePath, type, name) {
    const templates = {
      node: {
        files: {
          'package.json': JSON.stringify({
            name: name.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: `${name} - AI Generated Project`,
            main: 'index.js',
            scripts: {
              start: 'node index.js',
              dev: 'nodemon index.js',
              test: 'echo "No tests specified" && exit 0'
            },
            keywords: [],
            author: '',
            license: 'MIT'
          }, null, 2),
          'index.js': `// ${name}\nconsole.log('Hello from ${name}!');\n`,
          '.gitignore': 'node_modules/\n.env\n*.log\n',
          'README.md': `# ${name}\n\nAI Generated Node.js Project\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n`
        },
        dirs: ['src', 'tests']
      },
      python: {
        files: {
          'main.py': `# ${name}\ndef main():\n    print("Hello from ${name}!")\n\nif __name__ == "__main__":\n    main()\n`,
          'requirements.txt': '# Add your dependencies here\n',
          '.gitignore': '__pycache__/\n*.pyc\n.env\n*.log\nvenv/\n',
          'README.md': `# ${name}\n\nAI Generated Python Project\n\n## Getting Started\n\n\`\`\`bash\npip install -r requirements.txt\npython main.py\n\`\`\`\n`
        },
        dirs: ['src', 'tests']
      },
      react: {
        files: {
          'package.json': JSON.stringify({
            name: name.toLowerCase().replace(/\s+/g, '-'),
            version: '0.1.0',
            private: true,
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              'react-scripts': '5.0.1'
            },
            scripts: {
              start: 'react-scripts start',
              build: 'react-scripts build',
              test: 'react-scripts test',
              eject: 'react-scripts eject'
            }
          }, null, 2),
          '.gitignore': 'node_modules/\nbuild/\n.env\n*.log\n',
          'README.md': `# ${name}\n\nAI Generated React Project\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n`
        },
        dirs: ['public', 'src']
      },
      godot: {
        files: {
          'project.godot': `; Engine configuration file.\n; It's best edited using the editor UI and not directly,\nsince the parameters that go here are not all obvious.\n;\n; Format:\n;   [section] ; section goes between []\n;   param=value ; assign values to parameters\n\nconfig_version=5\n\napplication/config/name="${name}"\napplication/run/main_scene="res://main.tscn"\n`,
          '.gitignore': '.godot/\n*.import\nexport.cfg\n'
        },
        dirs: ['scenes', 'scripts', 'assets']
      },
      empty: {
        files: {
          '.gitignore': '*~\n*.swp\n.DS_Store\n',
          'README.md': `# ${name}\n\nNew Project\n`
        },
        dirs: []
      }
    };

    const template = templates[type] || templates.empty;

    // Create directories
    for (const dir of template.dirs || []) {
      await fs.mkdir(path.join(basePath, dir), { recursive: true });
    }

    // Create files
    if (template.files) {
      for (const [filename, content] of Object.entries(template.files)) {
        await fs.writeFile(path.join(basePath, filename), content);
      }
    }
  }

  async openProject(projectPath) {
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        throw new Error('Not a directory');
      }

      // Check if already in projects
      let project = this.projects.find(p => p.path === projectPath);
      
      if (!project) {
        const name = path.basename(projectPath);
        project = {
          id: `project_${Date.now()}`,
          name,
          type: 'unknown',
          path: projectPath,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.projects.push(project);
        await this.save();
      }

      return project;
    } catch (error) {
      throw new Error(`Failed to open project: ${error.message}`);
    }
  }

  async deleteProject(projectId) {
    const index = this.projects.findIndex(p => p.id === projectId);
    if (index === -1) {
      throw new Error('Project not found');
    }

    this.projects.splice(index, 1);
    await this.save();
    return true;
  }

  async updateProject(projectId, updates) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    Object.assign(project, updates, { updatedAt: new Date().toISOString() });
    await this.save();
    return project;
  }

  async getProjectFiles(projectPath) {
    const files = [];
    
    async function scanDir(dirPath, relativePath = '') {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.git') continue;
        if (entry.name === 'node_modules' || entry.name === '__pycache__') continue;
        
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath, relPath);
        } else {
          files.push({
            name: entry.name,
            path: relPath,
            fullPath
          });
        }
      }
    }
    
    await scanDir(projectPath);
    return files;
  }

  async readFile(filePath) {
    return await fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath, content) {
    await fs.writeFile(filePath, content);
    return true;
  }
}

module.exports = new ProjectService();
