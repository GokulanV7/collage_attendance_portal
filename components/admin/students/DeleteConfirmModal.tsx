'use client';

import React from 'react';
import { AdminStudent } from '@/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  student: AdminStudent | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  student,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl p-6">
          <div className="flex flex-col items-center text-center">
            {/* Warning Icon */}
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Student?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">{student.name}</span> ({student.rollNo})?
              <br />
              <span className="text-sm text-red-600">This action cannot be undone.</span>
            </p>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
