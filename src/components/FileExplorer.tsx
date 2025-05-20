import React from "react";
import { FileType } from "../types";

type Props = {
  files: FileType[];
  currentFile: string;
  onSelect: (filename: string) => void;
  onAdd: () => void;
  onDelete: (filename: string) => void;
  onRename: (oldName: string, newName: string) => void;
};

const FileExplorer: React.FC<Props> = ({
  files, currentFile, onSelect, onAdd, onDelete, onRename
}) => {
  const [renaming, setRenaming] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState("");

  return (
    <div style={{ padding: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Files</div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {files.map(f => (
          <li key={f.name} style={{
            marginBottom: 4,
            background: f.name === currentFile ? "#222" : undefined,
            borderRadius: 4,
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}>
            {renaming === f.name ? (
              <input
                value={newName}
                autoFocus
                onChange={e => setNewName(e.target.value)}
                onBlur={() => {
                  setRenaming(null);
                  if (newName && newName !== f.name) onRename(f.name, newName);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    setRenaming(null);
                    if (newName && newName !== f.name) onRename(f.name, newName);
                  }
                }}
                style={{ flex: 1 }}
              />
            ) : (
              <span
                style={{ flex: 1, cursor: "pointer" }}
                onClick={() => onSelect(f.name)}
              >
                {f.name}
              </span>
            )}
            <button style={{ marginLeft: 4 }} onClick={() => { setRenaming(f.name); setNewName(f.name); }} title="Rename">
              ✏️
            </button>
            <button style={{ marginLeft: 4 }} onClick={() => onDelete(f.name)} title="Delete">
              🗑️
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onAdd} style={{ marginTop: 8, width: "100%" }}>+ Add File</button>
    </div>
  );
};

export default FileExplorer;