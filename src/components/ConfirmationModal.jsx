// src/components/ConfirmationModal.jsx

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from './ui/Modal';
import { Button } from './ui/Button';
import { AlertTriangle } from 'lucide-react';

// This component has been refactored to use the new, accessible Modal system from src/components/ui/Modal.jsx.
// It provides a consistent and accessible confirmation dialog for destructive actions.

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-left">
              <ModalTitle>{title}</ModalTitle>
              <ModalDescription>{message}</ModalDescription>
            </div>
          </div>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
