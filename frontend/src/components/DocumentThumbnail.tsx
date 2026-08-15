import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../api/axios';
import { FileText } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentThumbnailProps {
  documentId: number;
}

export function DocumentThumbnail({ documentId }: DocumentThumbnailProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let objectUrl = '';
    const fetchPdf = async () => {
      try {
        const res = await api.get(`/api/documents/${documentId}/preview/`, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(res.data);
        setUrl(objectUrl);
      } catch (err) {
        setError(true);
      }
    };
    fetchPdf();
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId]);

  if (error || !url) {
    return (
      <div className="w-full h-full min-h-[200px] bg-gray-100 flex items-center justify-center">
        <FileText className="h-12 w-12 text-gray-300" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden bg-white flex items-start justify-center relative select-none" onContextMenu={e => e.preventDefault()}>
      <Document file={url} className="w-full h-full" loading={<div className="h-full flex items-center justify-center text-xs text-gray-500">Loading...</div>} error={<div className="h-full flex items-center justify-center text-xs text-red-500">Error</div>}>
        <Page 
          pageNumber={1} 
          width={400}
          renderTextLayer={false} 
          renderAnnotationLayer={false}
          className="w-full h-full [&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-cover"
        />
      </Document>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </div>
  );
}
