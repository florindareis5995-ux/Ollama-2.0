import React, { useState } from 'react';
import { FolderOpen, Plus, Trash2, FileCode, ChevronRight, ChevronDown } from 'lucide-react';

const ProjectManager = () => {
  const [projects, setProjects] = useState([
    { id: '1', name: 'My Web App', type: 'node', path: '/projects/my-web-app', createdAt: '2024-01-15' },
    { id: '2', name: 'Python Script', type: 'python', path: '/projects/python-script', createdAt: '2024-01-14' },
  ]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', type: 'node' });

  const projectTypes = [
    { id: 'node', name: 'Node.js' },
    { id: 'python', name: 'Python' },
    { id: 'react', name: 'React' },
    { id: 'godot', name: 'Godot' },
    { id: 'empty', name: 'Empty' }
  ];

  const handleCreate = async () => {
    if (!newProject.name.trim()) return;
    
    const project = {
      id: `project_${Date.now()}`,
      name: newProject.name,
      type: newProject.type,
      path: `/projects/${newProject.name.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setProjects(prev => [...prev, project]);
    setNewProject({ name: '', type: 'node' });
    setShowCreateModal(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleOpenFolder = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openFolderDialog();
      if (result.filePaths && result.filePaths.length > 0) {
        console.log('Opening folder:', result.filePaths[0]);
      }
    } else {
      console.log('Mock: Opening folder dialog...');
    }
  };

  const toggleExpand = (id) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  // Mock file tree
  const mockFiles = {
    node: [
      { name: 'src', type: 'folder', children: [
        { name: 'index.js', type: 'file' },
        { name: 'utils.js', type: 'file' }
      ]},
      { name: 'tests', type: 'folder', children: [] },
      { name: 'package.json', type: 'file' },
      { name: 'README.md', type: 'file' }
    ],
    python: [
      { name: 'src', type: 'folder', children: [
        { name: 'main.py', type: 'file' },
        { name: 'helpers.py', type: 'file' }
      ]},
      { name: 'tests', type: 'folder', children: [] },
      { name: 'requirements.txt', type: 'file' },
      { name: 'README.md', type: 'file' }
    ]
  };

  const FileTree = ({ files, depth = 0 }) => (
    <div className="mt-2">
      {files.map((item, idx) => (
        <div key={idx}>
          <div 
            className="flex items-center gap-2 py-1 px-2 hover:bg-slate-700 rounded cursor-pointer text-sm"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {item.type === 'folder' ? (
              <>
                <ChevronRight size={14} className="text-slate-500" />
                <FolderOpen size={14} className="text-yellow-500" />
              </>
            ) : (
              <>
                <span className="w-3.5"></span>
                <FileCode size={14} className="text-blue-400" />
              </>
            )}
            <span className="text-slate-300">{item.name}</span>
          </div>
          {item.children && item.children.length > 0 && (
            <FileTree files={item.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex bg-slate-900">
      {/* Projects List */}
      <div className="w-80 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-slate-700 px-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="New Project"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={handleOpenFolder}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <FolderOpen size={16} />
            Open Folder
          </button>
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-auto p-2">
          {projects.map(project => (
            <div key={project.id}>
              <div
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  expandedProject === project.id 
                    ? 'bg-slate-800 border border-slate-600' 
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => toggleExpand(project.id)}
                  >
                    {expandedProject === project.id ? (
                      <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400" />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <FolderOpen size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-white truncate">{project.name}</h3>
                      <p className="text-xs text-slate-400">{project.type} • {project.createdAt}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    className="p-1.5 hover:bg-red-600/20 text-slate-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {expandedProject === project.id && (
                <FileTree files={mockFiles[project.type] || []} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center">
        {projects.length === 0 ? (
          <div className="text-center">
            <FolderOpen className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-xl font-medium text-slate-400 mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-6">Create a new project or open an existing folder</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create Project
            </button>
          </div>
        ) : (
          <div className="text-center text-slate-500">
            <FolderOpen className="mx-auto mb-4 opacity-50" size={64} />
            <p>Select a project to view details</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 animate-slide-in">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Create New Project</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome Project"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Project Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {projectTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setNewProject(prev => ({ ...prev, type: type.id }))}
                      className={`py-3 px-4 rounded-lg border transition-colors text-sm ${
                        newProject.type === type.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newProject.name.trim()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
