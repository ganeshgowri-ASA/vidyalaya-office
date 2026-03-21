"use client";

import { useRef, useCallback, useState } from "react";
import { Upload, File, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useCloudStorageStore } from "@/store/cloud-storage-store";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { VFile, FileType } from "@/types";

const FILE_TYPE_MAP: Record<string, FileType> = {
  "text/plain": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "document",
  "application/vnd.ms-excel": "spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "spreadsheet",
  "application/vnd.ms-powerpoint": "presentation",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "presentation",
  "application/pdf": "pdf",
};

function detectFileType(mimeType: string, fileName: string): FileType {
  if (FILE_TYPE_MAP[mimeType]) return FILE_TYPE_MAP[mimeType];
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) return "document";
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "spreadsheet";
  if (["ppt", "pptx", "odp"].includes(ext)) return "presentation";
  if (ext === "pdf") return "pdf";
  return "document";
}

interface FileUploadButtonProps {
  className?: string;
  compact?: boolean;
}

export function FileUploadButton({ className, compact = false }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploadFile, authMode } = useCloudStorageStore();
  const { addRecentFile } = useAppStore();

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      for (let i = 0; i < fileList.length; i++) {
        const nativeFile = fileList[i];
        const fileType = detectFileType(nativeFile.type, nativeFile.name);
        const content = await nativeFile.text();

        const vFile: VFile = {
          id: `upload-${Date.now()}-${i}`,
          name: nativeFile.name,
          type: fileType,
          content,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          owner: "Admin User",
          tags: ["uploaded"],
          version: 1,
          size: nativeFile.size,
          folderId: "folder-root",
        };

        addRecentFile(vFile);
        await uploadFile(vFile, content);
      }
    },
    [uploadFile, addRecentFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  if (compact) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:opacity-80"
          style={{
            backgroundColor: "var(--primary)",
            color: "white",
          }}
        >
          <Upload size={12} />
          Upload
        </button>
      </>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors p-6",
          dragOver && "border-[var(--primary)]"
        )}
        style={{
          borderColor: dragOver ? "var(--primary)" : "var(--border)",
          backgroundColor: dragOver ? "rgba(59,130,246,0.05)" : "transparent",
        }}
      >
        <Upload size={24} style={{ color: "var(--muted-foreground)" }} />
        <p className="text-sm" style={{ color: "var(--foreground)" }}>
          Drop files here or click to upload
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {authMode === "authenticated"
            ? "Files will be saved to cloud storage"
            : "Files will be saved locally (sign in for cloud sync)"}
        </p>
      </div>
    </div>
  );
}
