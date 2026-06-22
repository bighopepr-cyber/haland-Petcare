"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: ReactNode;
  footer?: ReactNode;
}

const sizeClasses: { [key: string]: string } = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
  footer,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    contentRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center md:p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`
          relative flex max-h-[90vh] w-full flex-col bg-white shadow-xl focus:outline-none
          md:rounded-xl
          animate-slide-up md:animate-scale-in
          ${sizeClasses[size] || sizeClasses["md"]}
          ${size === "full" ? "md:mx-4" : ""}
        `}
        style={{
          maxHeight: size === "full" ? "100vh" : "90vh",
          borderRadius: size === "full" ? "0" : undefined,
        }}
      >
        {/* Header - sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:px-6 md:py-4 rounded-t-xl">
          <h2 className="text-base font-semibold text-slate-900 md:text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-4">
          {children}
        </div>

        {/* Footer - sticky */}
        {footer && (
          <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4 md:px-6 md:py-4 rounded-b-xl">
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end md:gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}