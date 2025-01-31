'use client'
import React, { useEffect, useState } from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000); 

    return () => clearTimeout(timeout);
  }, [pdf_url]);

  return (
    <div className="relative w-full h-full">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500">Loading PDF...</span>
        </div>
      ) : (
        <iframe
          src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
          className="w-full h-full"
          onLoad={() => setLoading(false)}  
        ></iframe>
      )}
    </div>
  );
};

export default PDFViewer;
