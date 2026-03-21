'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileAudio, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranscriptionStore } from '@/store/transcription-store';
import type { UploadProgress } from '@/types/transcription';

interface AudioUploadProps {
  language: string;
  onUploadComplete?: (sessionId: string) => void;
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AudioUpload({ language, onUploadComplete }: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploads, addUpload, updateUploadProgress, updateUploadStatus, removeUpload } =
    useTranscriptionStore();

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const validExtensions = /\.(mp3|wav|ogg|webm|m4a|aac|flac)$/i;
        if (!validExtensions.test(file.name)) {
          const upload: UploadProgress = {
            fileId: `upload-${generateId()}`,
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            status: 'error',
            errorMessage: 'Unsupported format. Use MP3, WAV, OGG, WebM, M4A, AAC, or FLAC.',
          };
          addUpload(upload);
          continue;
        }

        const uploadItem: UploadProgress = {
          fileId: `upload-${generateId()}`,
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
          status: 'uploading',
        };
        addUpload(uploadItem);

        // Simulate upload progress
        simulateUpload(uploadItem.fileId);
      }
    },
    [addUpload, updateUploadProgress, updateUploadStatus, language, onUploadComplete]
  );

  function simulateUpload(fileId: string) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        updateUploadProgress(fileId, 100);
        updateUploadStatus(fileId, 'processing');
        // Simulate processing
        setTimeout(() => {
          updateUploadStatus(fileId, 'completed');
          const sessionId = `session-${generateId()}`;
          if (onUploadComplete) {
            onUploadComplete(sessionId);
          }
        }, 2000);
      } else {
        updateUploadProgress(fileId, Math.min(progress, 99));
      }
    }, 300);
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const statusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <FileAudio className="h-4 w-4 opacity-50" />;
    }
  };

  const statusLabel = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Transcribing...';
      case 'completed':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
          isDragging ? 'border-blue-400 bg-blue-400/5' : 'hover:bg-white/[0.02]'
        )}
        style={{
          borderColor: isDragging ? '#60a5fa' : 'var(--border)',
          color: 'var(--foreground)',
        }}
      >
        <Upload className="mx-auto h-8 w-8 opacity-30 mb-2" />
        <p className="text-sm font-medium">
          Drop audio files here or click to browse
        </p>
        <p className="text-xs opacity-50 mt-1">
          MP3, WAV, OGG, WebM, M4A, AAC, FLAC (max 500MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.webm,.m4a,.aac,.flac,audio/*"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>

      {/* Upload list */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload) => (
            <div
              key={upload.fileId}
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                {statusIcon(upload.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate" style={{ color: 'var(--foreground)' }}>
                      {upload.fileName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUpload(upload.fileId);
                      }}
                      className="p-0.5 opacity-30 hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] opacity-50" style={{ color: 'var(--foreground)' }}>
                      {formatFileSize(upload.fileSize)}
                    </span>
                    <span className="text-[10px] opacity-50" style={{ color: 'var(--foreground)' }}>
                      {statusLabel(upload.status)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <div
                      className="mt-2 h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--border)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${upload.progress}%`,
                          backgroundColor:
                            upload.status === 'processing' ? '#eab308' : '#3b82f6',
                        }}
                      />
                    </div>
                  )}

                  {upload.errorMessage && (
                    <p className="text-[10px] text-red-400 mt-1">{upload.errorMessage}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
