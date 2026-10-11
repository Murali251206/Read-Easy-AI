"use client";

import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  selectedImage: File | null;
  imagePreviewUrl: string | null;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onImageRemoved,
  selectedImage,
  imagePreviewUrl,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = useCallback(
    (file: File) => {
      setErrorMessage(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMessage("Unsupported format. Please upload a PNG, JPEG, or WEBP image.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(
          `Image is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
        );
        return;
      }

      onImageSelected(file);
    },
    [onImageSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleTriggerUpload = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        id="image-file-input"
        aria-label="Upload an image file"
      />

      {imagePreviewUrl && selectedImage ? (
        /* Image Preview View */
        <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative w-full max-h-72 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreviewUrl}
              alt="Uploaded document preview"
              className="max-h-72 w-auto object-contain transition-all"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div className="truncate max-w-[200px] sm:max-w-xs font-medium text-slate-700">
              {selectedImage.name} ({(selectedImage.size / 1024).toFixed(0)} KB)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={onImageRemoved}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and Drop Upload Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerUpload}
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all text-center flex flex-col items-center justify-center ${
            isDragging
              ? "border-brand-500 bg-brand-50/70 scale-[0.99]"
              : "border-slate-200 bg-slate-50/50 hover:border-brand-400 hover:bg-white"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-brand-600 mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            <span className="text-brand-600 underline underline-offset-2">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500 mt-1">
            PNG, JPEG, or WEBP (up to {MAX_FILE_SIZE_MB}MB)
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Extracted completely in your browser — zero cloud uploads</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const canvas = document.createElement("canvas");
                canvas.width = 1000;
                canvas.height = 700;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 1000, 700);

                ctx.fillStyle = "#0f172a";
                ctx.font = "bold 38px sans-serif";
                ctx.fillText("DAILY EDUCATIONAL REPORT", 60, 90);

                ctx.strokeStyle = "#2563eb";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(60, 110);
                ctx.lineTo(420, 110);
                ctx.stroke();

                ctx.fillStyle = "#1e293b";
                ctx.font = "26px sans-serif";
                ctx.fillText("Good morning everyone.", 60, 180);
                ctx.fillText("Today, I would like to speak about hard work.", 60, 230);
                ctx.fillText("Success does not come without effort and dedication.", 60, 280);

                ctx.fillText("Hard work helps us achieve our goals.", 60, 380);
                ctx.fillText("It teaches us discipline, patience, and confidence.", 60, 430);
                ctx.fillText("Every small daily step creates great progress.", 60, 480);

                ctx.fillStyle = "#64748b";
                ctx.font = "italic 20px sans-serif";
                ctx.fillText("ReadEasy AI Visual Scanner - Sample Document", 60, 620);

                canvas.toBlob((blob) => {
                  if (blob) {
                    const sampleFile = new File([blob], "sample-educational-doc.png", { type: "image/png" });
                    onImageSelected(sampleFile);
                  }
                }, "image/png");
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors shadow-2xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>⚡ Try Sample Document Photo (1-Click Test)</span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
