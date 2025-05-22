export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; // only for files
  children?: FileNode[]; // only for folders
};