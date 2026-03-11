import type React from "react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  cancelText: string;
  confirmText: string;
  confirmAction: string;
  confirmMethod?: "post" | "get" | "put" | "patch" | "delete";
  hiddenInputs?: Record<string, string>;
  isDestructive?: boolean;
  maxWidth?: string;
}
