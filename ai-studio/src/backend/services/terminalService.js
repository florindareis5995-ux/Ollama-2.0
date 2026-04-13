const { spawn } = require('child_process');
const os = require('os');

class TerminalService {
  constructor() {
    this.processes = new Map();
    this.processId = 0;
  }

  async execute(command, cwd = null) {
    return new Promise((resolve, reject) => {
      const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';
      const shellArg = os.platform() === 'win32' ? '-Command' : '-c';
      
      const child = spawn(shell, [shellArg, command], {
        cwd: cwd || process.cwd(),
        env: { ...process.env },
        shell: true
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          exitCode: code,
          stdout,
          stderr,
          output: stdout || stderr
        });
      });

      child.on('error', reject);
    });
  }

  createSession(cwd = null) {
    const sessionId = `session_${++this.processId}`;
    const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';
    const shellArg = os.platform() === 'win32' ? '-Command' : '-c';

    const child = spawn(shell, [shellArg], {
      cwd: cwd || process.cwd(),
      env: { ...process.env },
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const session = {
      id: sessionId,
      child,
      cwd: cwd || process.cwd(),
      history: [],
      createdAt: new Date()
    };

    this.processes.set(sessionId, session);

    child.stderr.on('data', (data) => {
      session.onOutput?.({ type: 'stderr', data: data.toString() });
    });

    child.stdout.on('data', (data) => {
      session.onOutput?.({ type: 'stdout', data: data.toString() });
    });

    child.on('close', (code) => {
      session.onClose?.(code);
      this.processes.delete(sessionId);
    });

    return sessionId;
  }

  sendInput(sessionId, input) {
    const session = this.processes.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.history.push(input);
    session.child.stdin.write(input + '\n');
  }

  resize(sessionId, cols, rows) {
    const session = this.processes.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.child.stdout.isTTY) {
      session.child.stdout.rows = rows;
      session.child.stdout.columns = cols;
    }
  }

  closeSession(sessionId) {
    const session = this.processes.get(sessionId);
    if (!session) {
      return false;
    }

    session.child.kill('SIGTERM');
    this.processes.delete(sessionId);
    return true;
  }

  getSession(sessionId) {
    return this.processes.get(sessionId);
  }

  listSessions() {
    return Array.from(this.processes.values()).map(session => ({
      id: session.id,
      cwd: session.cwd,
      historyLength: session.history.length,
      createdAt: session.createdAt
    }));
  }

  async runOllamaCommand(args) {
    return await this.execute(`ollama ${args.join(' ')}`);
  }
}

module.exports = new TerminalService();
