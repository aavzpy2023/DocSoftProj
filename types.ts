export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string; // Full path, e.g., "Project Alpha/README.md"
  content?: string; // For files
  children?: FileNode[]; // For folders
  isOpen?: boolean; // For folders, to manage expand/collapse state
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isError: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}