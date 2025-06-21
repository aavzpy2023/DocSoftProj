
import React, { useRef, useEffect } from 'react';
import useEasyMDE from '../hooks/useEasyMDE';

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialValue, onChange, readOnly = false }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEasyMDE(textareaRef, initialValue, onChange, readOnly);

  return <textarea ref={textareaRef} className="w-full h-full border border-gray-300 rounded-md p-2"/>;
};

export default MarkdownEditor;
