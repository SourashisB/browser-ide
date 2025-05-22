import React, { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import FileExplorer from './components/FileExplorer';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import { FileNode } from './types';

function findNodeById(node: FileNode, id: string): FileNode | null {
  if (node.id === id) return node;
  if (node.type === 'folder') {
    for (let child of node.children!) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

function updateNodeById(node: FileNode, id: string, update: Partial<FileNode>): FileNode {
  if (node.id === id) {
    return { ...node, ...update };
  }
  if (node.type === 'folder') {
    return {
      ...node,
      children: node.children!.map(child => updateNodeById(child, id, update)),
    };
  }
  return node;
}

function deleteNodeById(node: FileNode, id: string): FileNode | null {
  if (node.id === id) return null;
  if (node.type === 'folder') {
    return {
      ...node,
      children: node.children!.map(child => deleteNodeById(child, id)).filter(Boolean) as FileNode[],
    };
  }
  return node;
}

function addNodeToParent(node: FileNode, parentId: string, newNode: FileNode): FileNode {
  if (node.id === parentId && node.type === 'folder') {
    return {
      ...node,
      children: [...node.children!, newNode],
    };
  }
  if (node.type === 'folder') {
    return {
      ...node,
      children: node.children!.map(child => addNodeToParent(child, parentId, newNode)),
    };
  }
  return node;
}

const initialFilesTree: FileNode = {
  id: uuidv4(),
  name: 'project',
  type: 'folder',
  children: [
    {
      id: uuidv4(),
      name: 'main.py',
      type: 'file',
      content: 'print("Hello, Python IDE!")',
    }
  ],
};

function getFirstFileId(node: FileNode): string | null {
  if (node.type === 'file') return node.id;
  for (let child of node.children!) {
    const result = getFirstFileId(child);
    if (result) return result;
  }
  return null;
}

function getMainFilePath(node: FileNode, mainFileId: string, currPath = ''): string | null {
  const path = currPath ? currPath + '/' + node.name : node.name;
  if (node.id === mainFileId && node.type === 'file') return path;
  if (node.type === 'folder') {
    for (let child of node.children!) {
      const found = getMainFilePath(child, mainFileId, path);
      if (found) return found;
    }
  }
  return null;
}

const App: React.FC = () => {
  const [filesTree, setFilesTree] = useState<FileNode>(initialFilesTree);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(getFirstFileId(initialFilesTree));
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedFile = selectedFileId ? findNodeById(filesTree, selectedFileId) : null;

  // File/folder operations
  const handleAdd = (parentId: string, type: 'file' | 'folder') => {
    const name = window.prompt(`New ${type} name?`, type === 'file' ? 'untitled.py' : 'new_folder');
    if (!name) return;
    const newNode: FileNode = type === 'file'
      ? { id: uuidv4(), name, type, content: '' }
      : { id: uuidv4(), name, type, children: [] };
    setFilesTree(prev => addNodeToParent(prev, parentId, newNode));
    if (type === 'file') setSelectedFileId(newNode.id);
  };

  const handleRename = (id: string, newName: string) => {
    if (!newName) return;
    setFilesTree(prev => updateNodeById(prev, id, { name: newName }));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete?')) return;
    setFilesTree(prev => {
      const updated = deleteNodeById(prev, id);
      // If deleted file was selected, select first file found
      if (selectedFileId === id) {
        setSelectedFileId(getFirstFileId(updated!));
      }
      return updated!;
    });
  };

  const handleEditorChange = (val: string) => {
    if (!selectedFileId) return;
    setFilesTree(prev => updateNodeById(prev, selectedFileId, { content: val }));
  };

  // Run code
  const handleRun = async () => {
    if (!selectedFileId) return;
    setLoading(true);
    setStdout('');
    setStderr('');
    const mainFilePath = getMainFilePath(filesTree, selectedFileId);
    try {
      const res = await axios.post('http://localhost:5000/run', {
        filesTree,
        mainFile: mainFilePath,
      });
      setStdout(res.data.stdout);
      setStderr(res.data.stderr);
    } catch (e: any) {
      setStdout('');
      setStderr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', background: '#f6f8fa' }}>
      {/* Sidebar: File Explorer */}
      <div style={{ width: 240, borderRight: '1px solid #ddd', padding: 10, background: '#fff', overflowY: 'auto' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Files</div>
        <FileExplorer
          filesTree={filesTree}
          selectedFileId={selectedFileId}
          onSelect={setSelectedFileId}
          onAdd={handleAdd}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </div>
      {/* Main Area: Editor + Terminal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Editor Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #ddd', background: '#fff' }}>
          <span style={{ fontWeight: 'bold', flex: 1 }}>
            {selectedFile?.name || 'No file selected'}
          </span>
          <button
            style={{
              background: '#36b',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 14px',
              cursor: 'pointer'
            }}
            onClick={handleRun}
            disabled={!selectedFile || loading}
          >
            ▶ Run
          </button>
        </div>
        {/* Editor and Terminal Split */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Editor */}
          <div style={{ flex: 2, borderRight: '1px solid #ddd', minWidth: 0, background: '#f6f8fa' }}>
            {selectedFile && selectedFile.type === 'file' ? (
              <Editor value={selectedFile.content || ''} onChange={handleEditorChange} />
            ) : (
              <div style={{ color: '#888', padding: 24 }}>Select a file to edit.</div>
            )}
          </div>
          {/* Terminal */}
          <div style={{ flex: 1, minWidth: 0, background: '#151515', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', color: '#fff', background: '#222', padding: 8, borderBottom: '1px solid #222' }}>Terminal</div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <Terminal stdout={stdout} stderr={stderr} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;