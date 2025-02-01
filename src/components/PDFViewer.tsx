'use client';
import React, { useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ pdf_url }) => {
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setErrorLoading(false);
  }, [pdf_url]);

  const handleIframeError = () => {
    setLoading(false);
    setErrorLoading(true);
  };

  if (!pdf_url) {
    return <div className="text-center text-gray-500">No PDF URL provided</div>;
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500">Loading PDF...</span>
        </div>
      )}

      {errorLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100">
          <span className="text-red-500">Failed to load PDF. Try refreshing.</span>
        </div>
      )}

      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(pdf_url)}&embedded=true`}
        className={`w-full h-full ${loading || errorLoading ? 'hidden' : ''}`}
        onLoad={() => setLoading(false)}
        onError={handleIframeError}
      />
    </div>
  );
};

export default PDFViewer;
