import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  X,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Music,
  Video,
  Projector,
  File,
  Image as ImageIcon,
  Download
} from 'lucide-react';

// Helper to determine icon by MIME type or extension
const getFileIcon = (type, name) => {
  const t = type.toLowerCase();
  const n = name.toLowerCase();

  if (t.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-sky-500" />;
  if (t.startsWith('video/')) return <Video className="w-4 h-4 text-purple-500" />;
  if (t.startsWith('audio/')) return <Music className="w-4 h-4 text-pink-500" />;
  if (t.includes('pdf') || n.endsWith('.pdf')) return <FileText className="w-4 h-4 text-red-500" />;
  if (t.includes('excel') || t.includes('spreadsheet') || n.endsWith('.xlsx') || n.endsWith('.csv')) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
  }
  if (t.includes('word') || n.endsWith('.doc') || n.endsWith('.docx')) {
    return <FileText className="w-4 h-4 text-blue-500" />;
  }
  if (t.includes('presentation') || t.includes('powerpoint') || n.endsWith('.ppt') || n.endsWith('.pptx')) {
    return <Projector className="w-4 h-4 text-orange-500" />;
  }
  if (t.includes('zip') || t.includes('compressed') || n.endsWith('.zip') || n.endsWith('.rar')) {
    return <FileArchive className="w-4 h-4 text-amber-500" />;
  }
  
  return <File className="w-4 h-4 text-slate-500" />;
};

// Helper to format bytes
const formatBytes = (bytes, decimals = 1) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function AttachmentUploader({ attachments = [], onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  // Clean up object URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      attachments.forEach(att => {
        if (att.previewUrl && att.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(att.previewUrl);
        }
      });
    };
  }, [attachments]);

  const processFiles = (files) => {
    const newAttachments = Array.from(files).map((file) => {
      const isImage = file.type.startsWith('image/');
      
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: formatBytes(file.size),
        rawSize: file.size,
        type: file.type,
        file: file, // Keep original file for potential upload
        isImage,
        // We'll generate object URLs for images for immediate preview
        previewUrl: isImage ? URL.createObjectURL(file) : null
      };
    });

    onChange([...attachments, ...newAttachments]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so the same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAttachment = (idToRemove) => {
    const attToRemove = attachments.find(a => a.id === idToRemove);
    if (attToRemove && attToRemove.previewUrl && attToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(attToRemove.previewUrl);
    }
    onChange(attachments.filter(att => att.id !== idToRemove));
  };

  const triggerDownload = (attachment) => {
    // If it's a real file we just selected
    if (attachment.file) {
      const url = URL.createObjectURL(attachment.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } 
    // If it's a persisted base64 image
    else if (attachment.previewData) {
      const a = document.createElement('a');
      a.href = attachment.previewData;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    // Otherwise it's mock persisted data without file content
    else {
      alert('In a real app, this would download the file from the server.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/50'
        }`}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileInput}
          className="hidden"
          multiple
        />
        <div className="p-3 rounded-full bg-white dark:bg-slate-950 shadow-sm mb-3">
          <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Click or drag files here to upload
        </p>
        <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">
          Support for Images, PDFs, Word, Excel, PowerPoint, Audio, Video, and ZIPs.
        </p>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {attachments.map(att => (
            <div
              key={att.id}
              className="group relative flex items-center gap-3 p-2 pr-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
            >
              {/* Preview or Icon */}
              <div className="w-10 h-10 shrink-0 rounded bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                {(att.previewUrl || att.previewData) ? (
                  <img
                    src={att.previewUrl || att.previewData}
                    alt={att.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getFileIcon(att.type, att.name)
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={att.name}>
                  {att.name}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-medium mt-0.5">
                  {att.size}
                </p>
              </div>

              {/* Actions Overlay */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-950 pl-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); triggerDownload(att); }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeAttachment(att.id); }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
