import React, { useState, useCallback, useEffect } from 'react';
import { FileNode, ModalState, User } from '../types';
import { INITIAL_FILE_STRUCTURE, APP_TITLE } from '../constants';
import Header from './Header';
import FileExplorer from './FileExplorer';
import MarkdownEditor from './MarkdownEditor';
import PreviewPane from './PreviewPane';
import Modal from './Modal';
import { publishSite, exportToPdf, saveFileContent as mockSaveFileContent } from '../services/apiService';

interface DocuHubEditorProps {
  currentUser: User | null;
  onLogout: () => void;
}

const findFileNode = (nodes: FileNode[], fileId: string): FileNode | null => {
  for (const node of nodes) {
    if (node.id === fileId) return node;
    if (node.children) {
      const found = findFileNode(node.children, fileId);
      if (found) return found;
    }
  }
  return null;
};

const updateFileNodeContent = (nodes: FileNode[], fileId: string, newContent: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === fileId && node.type === 'file') {
      return { ...node, content: newContent };
    }
    if (node.children) {
      return { ...node, children: updateFileNodeContent(node.children, fileId, newContent) };
    }
    return node;
  });
};

const toggleFolderNode = (nodes: FileNode[], folderId: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === folderId && node.type === 'folder') {
      return { ...node, isOpen: !node.isOpen };
    }
    if (node.children) {
      return { ...node, children: toggleFolderNode(node.children, folderId) };
    }
    return node;
  });
};


const DocuHubEditor: React.FC<DocuHubEditorProps> = ({ currentUser, onLogout }) => {
  const [fileStructure, setFileStructure] = useState<FileNode[]>(INITIAL_FILE_STRUCTURE);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false); // Renamed from isLoading to avoid conflict
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, title: '', message: '', isError: false });
  const [editorKey, setEditorKey] = useState<number>(0);

  useEffect(() => {
    if (selectedFileId) {
      const fileNode = findFileNode(fileStructure, selectedFileId);
      if (fileNode && fileNode.type === 'file') {
        setCurrentContent(fileNode.content || '');
        setEditorKey(prevKey => prevKey + 1); 
      } else {
        setCurrentContent(''); 
      }
    } else {
      setCurrentContent('');
    }
  }, [selectedFileId, fileStructure]);

  const handleFileSelect = useCallback((fileId: string) => {
    const node = findFileNode(fileStructure, fileId);
    if (node) {
      if (node.type === 'file') {
        setSelectedFileId(fileId);
      } else if (node.type === 'folder') {
        setFileStructure(prev => toggleFolderNode(prev, fileId));
      }
    }
  }, [fileStructure]);

  const handleContentChange = useCallback((value: string) => {
    setCurrentContent(value);
  }, []);

  const handleSaveFile = useCallback(async () => {
    if (!selectedFileId) {
      setModalState({ isOpen: true, title: 'Error', message: 'No file selected to save.', isError: true });
      return;
    }
    setIsLoadingAction(true);
    const result = await mockSaveFileContent(selectedFileId, currentContent);
    setIsLoadingAction(false);
    if (result.success) {
      setFileStructure(prev => updateFileNodeContent(prev, selectedFileId, currentContent));
      setModalState({ isOpen: true, title: 'Success', message: result.message, isError: false });
    } else {
      setModalState({ isOpen: true, title: 'Error', message: result.message, isError: true });
    }
  }, [selectedFileId, currentContent]);

  const handlePublishSite = useCallback(async () => {
    setIsLoadingAction(true);
    const result = await publishSite();
    setIsLoadingAction(false);
    setModalState({ isOpen: true, title: result.success ? 'Success' : 'Error', message: result.message, isError: !result.success });
  }, []);

  const handleExportToPdf = useCallback(async () => {
    if (!selectedFileId) {
      setModalState({ isOpen: true, title: 'Error', message: 'No file selected for PDF export.', isError: true });
      return;
    }
    const fileNode = findFileNode(fileStructure, selectedFileId);
    if (!fileNode || fileNode.type !== 'file') {
      setModalState({ isOpen: true, title: 'Error', message: 'Selected item is not a file.', isError: true });
      return;
    }
    setIsLoadingAction(true);
    const result = await exportToPdf(fileNode.path);
    setIsLoadingAction(false);
    setModalState({ isOpen: true, title: result.success ? 'Success' : 'Error', message: result.message, isError: !result.success });
  }, [selectedFileId, fileStructure]);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header
        title={APP_TITLE}
        user={currentUser}
        onSave={handleSaveFile}
        onPublish={handlePublishSite}
        onExportPdf={handleExportToPdf}
        onLogout={onLogout}
        isActionDisabled={isLoadingAction || !selectedFileId}
        isPublishDisabled={isLoadingAction}
      />
      <main className="flex-grow flex overflow-hidden bg-gray-50">
        <div className="w-1/4 min-w-[250px] max-w-[400px] bg-white border-r border-gray-200 overflow-y-auto p-4 shadow-sm">
          <FileExplorer files={fileStructure} selectedFileId={selectedFileId} onFileSelect={handleFileSelect} />
        </div>
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-700">Editor</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-1 bg-white">
            {selectedFileId ? (
              <MarkdownEditor
                key={editorKey}
                initialValue={currentContent}
                onChange={handleContentChange}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a file to start editing or create a new one.</p>
              </div>
            )}
          </div>
        </div>
        <div className="w-1/4 flex flex-col overflow-hidden bg-gray-50 border-l border-gray-200">
           <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-700">Preview</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 prose max-w-none">
            <PreviewPane markdownContent={currentContent} />
          </div>
        </div>
      </main>
      {isLoadingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        isError={modalState.isError}
      >
        <p>{modalState.message}</p>
      </Modal>
    </div>
  );
};

export default DocuHubEditor;