"use client";

import { useState, useRef, type DragEvent } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { type ThemeVariant } from "@/lib/utils/theme";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  multiple?: boolean;
  variant?: ThemeVariant;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload({
  onUpload,
  currentUrl,
  multiple = false,
  variant = "professional",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Tipe file harus JPG, PNG, atau WebP");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    // Show local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Simulate upload (in production, upload to Supabase/cloud storage)
    setIsUploading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsUploading(false);

    // For now, return the local URL as a placeholder
    // In production, replace with actual upload logic
    onUpload(localUrl);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) handleFile(files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files[0]) handleFile(files[0]);
  };

  const removeImage = () => {
    setPreview(null);
    onUpload("");
  };

  const radiusClass = variant === "professional" ? "rounded-lg" : "rounded-xl";

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 transition-colors ${
          isDragOver
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        } ${radiusClass}`}
      >
        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={384}
              height={192}
              className="max-h-48 rounded object-contain"
              style={{ width: "auto", height: "auto", maxHeight: "12rem" }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">
              {isUploading
                ? "Mengupload..."
                : "Seret gambar ke sini atau klik untuk memilih"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG, WebP. Maks 5MB.
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {isUploading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-500" />
        </div>
      )}
    </div>
  );
}