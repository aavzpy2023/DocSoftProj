
import React, { useEffect, useState } from 'react';

// Declare marked as an external library
declare var marked: any;

interface PreviewPaneProps {
  markdownContent: string;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ markdownContent }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    if (typeof marked !== 'undefined') {
      try {
        setHtmlContent(marked.parse(markdownContent));
      } catch (error) {
        console.error("Error parsing Markdown:", error);
        setHtmlContent("<p>Error rendering Markdown preview.</p>");
      }
    } else {
      setHtmlContent("<p>Markdown renderer (marked.js) not loaded.</p>");
    }
  }, [markdownContent]);

  return (
    <div
      className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none w-full h-full"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default PreviewPane;
