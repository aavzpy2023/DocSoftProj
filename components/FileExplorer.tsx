
import React from 'react';
import { FileNode } from '../types';
import FolderIcon from './icons/FolderIcon';
import FileIcon from './icons/FileIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface FileExplorerProps {
  files: FileNode[];
  selectedFileId: string | null;
  onFileSelect: (fileId: string) => void;
  level?: number;
}

const FileExplorerItem: React.FC<{ node: FileNode; selectedFileId: string | null; onFileSelect: (fileId: string) => void; level: number }> = ({ node, selectedFileId, onFileSelect, level }) => {
  const isSelected = node.id === selectedFileId;
  const isFolder = node.type === 'folder';

  const handleClick = () => {
    onFileSelect(node.id);
  };

  const paddingLeft = `${level * 1.25}rem`; // 0.75rem = 12px, 1.25rem = 20px

  return (
    <div>
      <div
        onClick={handleClick}
        style={{ paddingLeft }}
        className={`flex items-center space-x-2 p-2 cursor-pointer rounded-md hover:bg-gray-200 transition-colors
                    ${isSelected && node.type === 'file' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'}
                    ${isSelected && node.type === 'folder' ? 'bg-gray-100' : ''}
                  `}
      >
        {isFolder ? (
          node.isOpen ? <ChevronDownIcon className="w-4 h-4 text-gray-500" /> : <ChevronRightIcon className="w-4 h-4 text-gray-500" />
        ) : (
          <div className="w-4"></div> // Placeholder for icon alignment
        )}
        {isFolder ? <FolderIcon className="w-5 h-5 text-yellow-500" /> : <FileIcon className="w-5 h-5 text-blue-500" />}
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && node.isOpen && node.children && (
        <FileExplorer files={node.children} selectedFileId={selectedFileId} onFileSelect={onFileSelect} level={level + 1} />
      )}
    </div>
  );
};


const FileExplorer: React.FC<FileExplorerProps> = ({ files, selectedFileId, onFileSelect, level = 0 }) => {
  return (
    <nav className="space-y-1">
      {files.map(node => (
        <FileExplorerItem key={node.id} node={node} selectedFileId={selectedFileId} onFileSelect={onFileSelect} level={level}/>
      ))}
    </nav>
  );
};

export default FileExplorer;
