const axios = require('axios');

const OLLAMA_BASE_URL = 'http://localhost:11434';

class OllamaService {
  constructor() {
    this.api = axios.create({
      baseURL: OLLAMA_BASE_URL,
      timeout: 300000 // 5 minutes for model pulls
    });
  }

  async isRunning() {
    try {
      await this.api.get('/api/tags');
      return true;
    } catch (error) {
      return false;
    }
  }

  async listModels() {
    try {
      const response = await this.api.get('/api/tags');
      const models = response.data.models || [];
      
      return models.map(model => ({
        name: model.name,
        size: model.size ? this.formatSize(model.size) : 'Unknown',
        digest: model.digest?.substring(0, 12) || 'Unknown',
        modifiedAt: model.modified_at ? new Date(model.modified_at).toLocaleDateString() : 'Unknown',
        family: model.details?.family || 'Unknown',
        parameters: model.details?.parameter_size || 'Unknown'
      }));
    } catch (error) {
      throw new Error(`Failed to list models: ${error.message}`);
    }
  }

  formatSize(bytes) {
    if (!bytes) return 'Unknown';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  async pullModel(modelName, onProgress) {
    try {
      const response = await this.api.post(
        '/api/pull',
        { name: modelName, stream: true },
        { 
          timeout: 600000,
          responseType: 'stream'
        }
      );

      return new Promise((resolve, reject) => {
        let progress = '';
        
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.status) {
                progress = data.status;
                if (data.completed && data.total) {
                  const percent = ((data.completed / data.total) * 100).toFixed(1);
                  progress = `${data.status} (${percent}%)`;
                }
                if (onProgress) {
                  onProgress({ status: progress, ...data });
                }
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        });

        response.data.on('end', () => {
          resolve({ success: true, message: `Model ${modelName} pulled successfully` });
        });

        response.data.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to pull model: ${error.message}`);
    }
  }

  async removeModel(modelName) {
    try {
      await this.api.delete('/api/delete', {
        data: { name: modelName }
      });
      return { success: true, message: `Model ${modelName} removed successfully` };
    } catch (error) {
      throw new Error(`Failed to remove model: ${error.message}`);
    }
  }

  async chat(model, messages) {
    try {
      const response = await this.api.post('/api/chat', {
        model,
        messages,
        stream: false
      });
      
      return {
        role: response.data.message?.role || 'assistant',
        content: response.data.message?.content || '',
        done: response.data.done || false
      };
    } catch (error) {
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  async chatStream(model, messages, onChunk) {
    try {
      const response = await this.api.post(
        '/api/chat',
        { model, messages, stream: true },
        { responseType: 'stream' }
      );

      return new Promise((resolve, reject) => {
        let fullContent = '';
        
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                fullContent += data.message.content;
                if (onChunk) {
                  onChunk({
                    content: data.message.content,
                    done: data.done || false
                  });
                }
              }
              if (data.done) {
                resolve({ content: fullContent, done: true });
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        });

        response.data.on('end', () => {
          resolve({ content: fullContent, done: true });
        });

        response.data.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Streaming chat failed: ${error.message}`);
    }
  }

  async generate(prompt, model = 'llama2', options = {}) {
    try {
      const response = await this.api.post('/api/generate', {
        model,
        prompt,
        stream: false,
        ...options
      });
      
      return {
        response: response.data.response || '',
        done: response.data.done || false
      };
    } catch (error) {
      throw new Error(`Generate failed: ${error.message}`);
    }
  }
}

module.exports = new OllamaService();
