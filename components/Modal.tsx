
import React, { useId } from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isError?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, isError = false }) => {
  const titleId = useId(); // Generate a unique ID for aria-labelledby

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3 id={titleId} className={`text-xl font-semibold ${isError ? 'text-red-600' : 'text-gray-800'}`}>{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl p-1 -m-1 leading-none" // Added padding for easier click, adjusted margin
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="text-gray-700 mb-6">
          {children}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} variant={isError ? 'danger': 'primary'}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;