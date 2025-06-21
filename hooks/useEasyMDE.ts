
import React, { useEffect, useRef } from 'react';

// Declare EasyMDE as an external library
declare var EasyMDE: any;

const useEasyMDE = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  initialValue: string,
  onChange: (value: string) => void,
  readOnly: boolean = false
) => {
  const easyMDERef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      if (!EasyMDE) {
        console.error("EasyMDE library not found. Make sure it's loaded via CDN.");
        return;
      }
      
      easyMDERef.current = new EasyMDE({
        element: textareaRef.current,
        initialValue: initialValue,
        spellChecker: false, // Optionally disable spell checker
        status: false, // Optionally hide status bar
        // Add more EasyMDE options as needed
        // Example: toolbar: ["bold", "italic", "|", "quote"]
        toolbar: [
            "bold", "italic", "heading", "|", 
            "quote", "unordered-list", "ordered-list", "|",
            "link", "image", "|",
            "preview", "side-by-side", "fullscreen", "|",
            "guide"
        ],
        minHeight: "300px", // Ensure editor has a minimum height
        // To make it fill available space:
        // You might need to set parent container height correctly.
        // This hook itself won't manage that, but EasyMDE will try to adapt.
      });

      easyMDERef.current.codemirror.on('change', () => {
        if (easyMDERef.current) {
          onChange(easyMDERef.current.value());
        }
      });

      if (readOnly) {
        easyMDERef.current.codemirror.setOption('readOnly', true);
      }
    }

    return () => {
      if (easyMDERef.current) {
        easyMDERef.current.toTextArea(); // Clean up EasyMDE instance
        easyMDERef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textareaRef, onChange, readOnly]); // initialValue removed to prevent re-init on content change from parent, parent should control value via key prop if needed for full re-init

  // Effect to update editor value if initialValue prop changes (e.g., new file loaded)
  // This is handled by re-keying the MarkdownEditor component in App.tsx
  // This ensures a clean re-initialization of EasyMDE when the file changes.
  // If not re-keying, you'd need logic like this:
  /*
  useEffect(() => {
    if (easyMDERef.current && initialValue !== easyMDERef.current.value()) {
      easyMDERef.current.value(initialValue);
    }
  }, [initialValue]);
  */
};

export default useEasyMDE;
