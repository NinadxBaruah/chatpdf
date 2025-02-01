'use client';
import React, { useEffect, useState, useRef } from 'react';

interface PDFViewerProps {
  pdf_url: string;
  className?: string;
  style?: React.CSSProperties;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdf_url, className = '', style = {} }) => {
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0); // Used to force iframe refresh

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

  const refreshIframe = () => {
    setIframeKey(prev => prev + 1); // Force iframe refresh by changing key
  };

  if (!pdf_url) {
    return <div className="text-center text-gray-500">No PDF URL provided</div>;
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className={`w-full flex flex-col ${className}`} style={style}>
        {/* Refresh button */}
        <button
          onClick={refreshIframe}
          className="self-end mb-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          Refresh PDF
        </button>

        {/* Google Drive Viewer iframe */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdf_url)}`}
          className="w-full h-[calc(100%-40px)] min-h-[500px] border-0"
          allow="fullscreen"
        />

        {/* Fallback options */}
        <div className="mt-2 flex gap-2 justify-end">
          <a 
            href={pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            Open in New Tab
          </a>
          <a 
            href={pdf_url}
            download
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
          >
            Download
          </a>
        </div>
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