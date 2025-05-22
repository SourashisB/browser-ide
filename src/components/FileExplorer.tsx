import React, { useState } from 'react';
import { FileNode } from '../types';

type FileExplorerProps = {
  filesTree: FileNode;
  selectedFileId: string | null;
  onSelect: (id: string) => void;
  onAdd: (parentId: string, type: 'file' | 'folder') => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
};

const FileExplorer: React.FC<FileExplorerProps> = ({
  filesTree,
  selectedFileId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const renderNode = (node: FileNode, level = 0) => (
    <div style={{ marginLeft: level * 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: node.id === selectedFileId ? '#e0e0e0' : undefined,
          borderRadius: 4,
        }}
        onClick={() => node.type === 'file' && onSelect(node.id)}
      >
        <span style={{ marginRight: 4 }}>
          {node.type === 'folder' ? '📁' : '📄'}
        </span>
        {renamingId === node.id ? (
          <>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onBlur={() => {
                onRename(node.id, newName.trim());
                setRenamingId(null);
              }}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onRename(node.id, newName.trim());
                  setRenamingId(null);
                }
              }}
              style={{ width: 80 }}
            />
          </>
        ) : (
          <span
            style={{ flex: 1, cursor: node.type === 'file' ? 'pointer' : 'default' }}
            onDoubleClick={() => {
              setRenamingId(node.id);
              setNewName(node.name);
            }}
          >
            {node.name}
          </span>
        )}
        <button style={{ marginLeft: 4 }} onClick={e => { e.stopPropagation(); setRenamingId(node.id); setNewName(node.name); }}>✏️</button>
        <button style={{ marginLeft: 4 }} onClick={e => { e.stopPropagation(); onDelete(node.id); }}>🗑️</button>
        {node.type === 'folder' && (
          <>
            <button style={{ marginLeft: 4 }} onClick={e => { e.stopPropagation(); onAdd(node.id, 'file'); }}>📄+</button>
            <button style={{ marginLeft: 4 }} onClick={e => { e.stopPropagation(); onAdd(node.id, 'folder'); }}>📁+</button>
          </>
        )}
      </div>
      {node.type === 'folder' && node.children!.map(child => (
        <div key={child.id}>
          {renderNode(child, level + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ fontSize: 14 }}>
      {renderNode(filesTree)}
    </div>
  );
};

export default FileExplorer;