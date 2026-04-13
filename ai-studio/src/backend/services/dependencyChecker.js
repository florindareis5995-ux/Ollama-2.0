const { exec, spawn } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class DependencyChecker {
  constructor() {
    this.dependencies = {
      ollama: {
        name: 'Ollama',
        checkCommand: 'ollama --version',
        installCommand: this.getOllamaInstallCommand(),
        description: 'Local AI model runner'
      },
      node: {
        name: 'Node.js',
        checkCommand: 'node --version',
        installCommand: this.getNodeInstallCommand(),
        description: 'JavaScript runtime'
      },
      python: {
        name: 'Python',
        checkCommand: 'python3 --version || python --version',
        installCommand: this.getPythonInstallCommand(),
        description: 'Python interpreter'
      },
      git: {
        name: 'Git',
        checkCommand: 'git --version',
        installCommand: this.getGitInstallCommand(),
        description: 'Version control system'
      }
    };
  }

  getOllamaInstallCommand() {
    const platform = process.platform;
    if (platform === 'darwin') {
      return 'curl -fsSL https://ollama.com/install.sh | sh';
    } else if (platform === 'win32') {
      return 'winget install Ollama.Ollama';
    } else {
      return 'curl -fsSL https://ollama.com/install.sh | sh';
    }
  }

  getNodeInstallCommand() {
    const platform = process.platform;
    if (platform === 'darwin') {
      return 'brew install node';
    } else if (platform === 'win32') {
      return 'winget install OpenJS.NodeJS.LTS';
    } else {
      return 'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs';
    }
  }

  getPythonInstallCommand() {
    const platform = process.platform;
    if (platform === 'darwin') {
      return 'brew install python';
    } else if (platform === 'win32') {
      return 'winget install Python.Python.3.11';
    } else {
      return 'sudo apt-get install -y python3 python3-pip';
    }
  }

  getGitInstallCommand() {
    const platform = process.platform;
    if (platform === 'darwin') {
      return 'brew install git';
    } else if (platform === 'win32') {
      return 'winget install Git.Git';
    } else {
      return 'sudo apt-get install -y git';
    }
  }

  async check(name) {
    const dep = this.dependencies[name];
    if (!dep) {
      throw new Error(`Unknown dependency: ${name}`);
    }

    try {
      const result = await execAsync(dep.checkCommand);
      return {
        name: dep.name,
        installed: true,
        version: result.stdout.trim(),
        description: dep.description
      };
    } catch (error) {
      return {
        name: dep.name,
        installed: false,
        version: null,
        description: dep.description,
        error: error.message
      };
    }
  }

  async checkAll() {
    const results = {};
    
    for (const [key, dep] of Object.entries(this.dependencies)) {
      results[key] = await this.check(key);
    }

    const allInstalled = Object.values(results).every(r => r.installed);
    
    return {
      dependencies: results,
      allInstalled,
      missing: Object.entries(results)
        .filter(([_, r]) => !r.installed)
        .map(([key, r]) => ({ key, ...r }))
    };
  }

  async install(name) {
    const dep = this.dependencies[name];
    if (!dep) {
      throw new Error(`Unknown dependency: ${name}`);
    }

    return new Promise((resolve, reject) => {
      console.log(`Installing ${dep.name}...`);
      
      const child = spawn(dep.installCommand, {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            message: `${dep.name} installed successfully`,
            output
          });
        } else {
          reject(new Error(`Installation failed with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', reject);
    });
  }
}

module.exports = new DependencyChecker();
