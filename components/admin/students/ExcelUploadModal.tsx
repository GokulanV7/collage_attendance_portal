'use client';

import React, { useState, useRef } from 'react';
import { useStudents } from '@/context/StudentsContext';
import { parseExcelFile, ParsedStudentRow } from '@/utils/excel/studentExcel';
import { safeSessionStorage } from '@/utils/safeSessionStorage';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  adminDept?: string | null;
  prefillBatch?: string;
  prefillClass?: string;
}

type UploadStep = 'upload' | 'preview' | 'result';

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminDept,
  prefillBatch,
  prefillClass,
}) => {
  const { bulkAddStudents, students } = useStudents();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STUDENTS_STORAGE_KEY = 'admin_students';
  
  // Check if admin is restricted to a specific department
  const isRestrictedAdmin = Boolean(adminDept && adminDept !== 'Overall');
  
  const [step, setStep] = useState<UploadStep>('upload');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedStudentRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [result, setResult] = useState<{ added: number; skipped: number; duplicates: string[] } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setParseErrors(['Please upload an Excel file (.xlsx or .xls)']);
      return;
    }

    setLoading(true);
    setParseErrors([]);

    const { success, data, errors } = await parseExcelFile(file);

    setLoading(false);

    if (errors.length > 0) {
      setParseErrors(errors);
    }

    if (data.length > 0) {
      const normalizedRows: ParsedStudentRow[] = data.map((row) => ({
        ...row,
        batch: prefillBatch || row.batch,
        class: prefillClass || row.class,
        department: isRestrictedAdmin && adminDept ? adminDept : row.department,
      }));

      // If admin is department restricted and file rows still contain other departments,
      // keep only allowed rows and show a warning count.
      let filteredData = normalizedRows;
      if (isRestrictedAdmin && adminDept) {
        const beforeCount = normalizedRows.length;
        filteredData = normalizedRows.filter(
          (row) => row.department.toUpperCase() === adminDept.toUpperCase()
        );
        const wrongDeptCount = beforeCount - filteredData.length;

        if (wrongDeptCount > 0) {
          setParseErrors((prev) => [
            ...prev,
            `${wrongDeptCount} students excluded: not in ${adminDept} department`,
          ]);
        }
      }

      // Check duplicates against storage and within the uploaded file.
      const storedStudents = safeSessionStorage.getJSON(STUDENTS_STORAGE_KEY, students);
      const existingRollNos = new Set(
        storedStudents.map((s: { rollNo: string }) => s.rollNo.toLowerCase())
      );

      const duplicateInFile = new Set<string>();
      const duplicateAlreadyRegistered = new Set<string>();
      const seenInFile = new Set<string>();
      const uniqueRows: ParsedStudentRow[] = [];

      filteredData.forEach((row) => {
        const rollNoLower = row.rollNo.toLowerCase();

        if (existingRollNos.has(rollNoLower)) {
          duplicateAlreadyRegistered.add(row.rollNo);
          return;
        }

        if (seenInFile.has(rollNoLower)) {
          duplicateInFile.add(row.rollNo);
          return;
        }

        seenInFile.add(rollNoLower);
        uniqueRows.push(row);
      });

      const duplicateMessages: string[] = [];
      if (duplicateAlreadyRegistered.size > 0) {
        const examples = Array.from(duplicateAlreadyRegistered).slice(0, 10);
        duplicateMessages.push(
          `Skipped ${duplicateAlreadyRegistered.size} rows: roll numbers already registered. Examples: ${examples.join(', ')}${duplicateAlreadyRegistered.size > 10 ? '...' : ''}`
        );
      }
      if (duplicateInFile.size > 0) {
        const examples = Array.from(duplicateInFile).slice(0, 10);
        duplicateMessages.push(
          `Skipped ${duplicateInFile.size} rows: duplicate roll numbers inside the file. Examples: ${examples.join(', ')}${duplicateInFile.size > 10 ? '...' : ''}`
        );
      }

      if (duplicateMessages.length > 0) {
        setParseErrors((prev) => [...prev, ...duplicateMessages]);
      }

      if (uniqueRows.length === 0) {
        setParsedData([]);
        setStep('upload');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setParsedData(uniqueRows);
      setStep('preview');
    } else if (!success) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmUpload = () => {
    setLoading(true);

    const uploadResult = bulkAddStudents(parsedData);
    setResult(uploadResult);
    setStep('result');
    setLoading(false);

    if (uploadResult.added > 0) {
      onSuccess(`Successfully added ${uploadResult.added} students`);
    }
  };

  const handleClose = () => {
    // Reset state before closing to prevent flashing the upload screen
    setStep('upload');
    setParsedData([]);
    setParseErrors([]);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div 
          className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'upload' && 'Upload Excel File'}
              {step === 'preview' && 'Preview Students'}
              {step === 'result' && 'Upload Complete'}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Upload Step */}
            {step === 'upload' && (
              <div className="space-y-6">
                {/* Dropzone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    loading ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-blue-500 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <p className="mt-4 text-gray-600">Parsing file...</p>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-4 text-gray-600">Drag and drop an Excel file here, or click to browse</p>
                      <p className="mt-1 text-sm text-gray-400">
                        Supports .xlsx and .xls files
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </button>
                    </>
                  )}
                </div>

                {/* Errors */}
                {parseErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Validation Errors</h4>
                    <ul className="space-y-1 text-sm text-red-600 max-h-40 overflow-y-auto">
                      {parseErrors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expected Format */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Expected Excel Format</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left font-medium text-gray-600">name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">rollNo</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">batch</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">department</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">class</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">semester</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 text-gray-500">John Doe</td>
                          <td className="px-3 py-2 text-gray-500">21CSE001</td>
                          <td className="px-3 py-2 text-gray-500">2021-2025</td>
                          <td className="px-3 py-2 text-gray-500">CSE</td>
                          <td className="px-3 py-2 text-gray-500">Section A</td>
                          <td className="px-3 py-2 text-gray-500">5</td>
                          <td className="px-3 py-2 text-gray-500">john@email.com</td>
                          <td className="px-3 py-2 text-gray-500">9876543210</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    Found <span className="font-semibold text-gray-900">{parsedData.length}</span> valid students
                  </p>
                  <button
                    onClick={() => {
                      setStep('upload');
                      setParsedData([]);
                      setParseErrors([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Upload Different File
                  </button>
                </div>

                {/* Info banner when batch/class is being overridden */}

                {(prefillBatch || prefillClass) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      ℹ️ All students will be added to{' '}
                      <span className="font-semibold">{prefillClass || 'selected class'}</span>
                      {prefillBatch && (
                        <>, batch <span className="font-semibold">{prefillBatch}</span></>
                      )}
                      {adminDept && (
                        <>, {adminDept}</>
                      )}
                      .
                    </p>
                  </div>
                )}

                {/* Errors warning */}
                {parseErrors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      ⚠️ Some rows were skipped due to validation errors. {parseErrors.length} issues found.
                    </p>
                    <ul className="space-y-0.5 text-xs text-yellow-700 max-h-28 overflow-y-auto">
                      {parseErrors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preview Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-80 overflow-x-auto overflow-y-auto">
                    <table className="w-full min-w-max text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">#</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Roll No</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Batch</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Dept</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Class</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Sem</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Email</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.rollNo}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.batch}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.department}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.class}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.semester}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.email || '-'}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.phone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Result Step */}
            {step === 'result' && result && (
              <div className="space-y-6 text-center">
                {/* Success Indicator */}
                <div className="flex flex-col items-center">
                  {result.added > 0 ? (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{result.added}</div>
                    <div className="text-sm text-green-700">Added</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                    <div className="text-sm text-yellow-700">Skipped</div>
                  </div>
                </div>

                {/* Duplicates List */}
                {result.duplicates.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-yellow-800 mb-2">Skipped Duplicates</h4>
                    <p className="text-sm text-yellow-700">
                      {result.duplicates.slice(0, 10).join(', ')}
                      {result.duplicates.length > 10 && ` and ${result.duplicates.length - 10} more...`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            {step === 'upload' && (
              <button
                onClick={handleClose}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}

            {step === 'preview' && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={loading || parsedData.length === 0}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    `Add ${parsedData.length} Students`
                  )}
                </button>
              </>
            )}

            {step === 'result' && (
              <button
                onClick={handleClose}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
