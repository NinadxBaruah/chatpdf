'use client';
import React, { useEffect, useState } from 'react';

interface PDFViewerProps {
  pdf_url: string;
  className?: string;
  style?: React.CSSProperties;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdf_url, className = '', style = {} }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = 
        typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!pdf_url) {
    return <div className="text-center text-gray-500">No PDF URL provided</div>;
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className={`w-full flex flex-col items-center justify-center p-4 ${className}`} style={style}>
        <div className="text-center mb-4">
          <p className="text-gray-600 mb-2">Choose an option to view the PDF:</p>
        </div>
        
        {/* Download option */}
        <a 
          href={pdf_url}
          download
          className="w-full max-w-sm mb-3 px-4 py-3 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-600 transition-colors"
        >
          Download PDF
        </a>
        
        {/* Open in new tab option */}
        <a 
          href={pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-sm px-4 py-3 bg-gray-500 text-white rounded-lg text-center hover:bg-gray-600 transition-colors"
        >
          Open in New Tab
        </a>

        {/* Google Drive Viewer option (as fallback) */}
        <a 
          href={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdf_url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-sm mt-3 px-4 py-3 bg-green-500 text-white rounded-lg text-center hover:bg-green-600 transition-colors"
        >
          Open in Google Viewer
        </a>
      </div>
    );
  }

  // Desktop view
  return (
    <div className={`w-full h-full ${className}`} style={style}>
      {/* Primary viewer */}
      <embed
        src={pdf_url}
        type="application/pdf"
        className="w-full h-full"
        aria-label="PDF Viewer"
      />

      {/* Fallback for browsers that don't support embed */}
      <object
        data={pdf_url}
        type="application/pdf"
        className="w-full h-full hidden"
      >
        {/* Final fallback - direct link */}
        <div className="w-full h-full flex items-center justify-center">
          <a 
            href={pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Open PDF
          </a>
        </div>
      </object>
    </div>
  );
};

export default PDFViewer;