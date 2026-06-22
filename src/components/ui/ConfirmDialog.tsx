"use client";

import { Modal } from "./Modal";
import { type ThemeVariant } from "@/lib/utils/theme";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  variant?: ThemeVariant;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Konfirmasi",
  danger = false,
  variant = "professional",
}: ConfirmDialogProps) {
  const buttonClass = danger
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-emerald-600 hover:bg-emerald-700 text-white";

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      variant={variant}
      footer={
        <>
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${buttonClass}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{description}</p>
    </Modal>
  );
}