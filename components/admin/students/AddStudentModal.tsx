'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStudents } from '@/context/StudentsContext';
import { AdminStudent } from '@/types';

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  rollNo: z.string().min(1, 'Roll number is required'),
  batch: z.string().min(1, 'Batch is required'),
  department: z.string().min(1, 'Department is required'),
  class: z.string().min(1, 'Class is required'),
  semester: z.number().min(1, 'Semester must be between 1-8').max(8, 'Semester must be between 1-8'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  editStudent?: AdminStudent | null;
  adminDept?: string | null;
  prefillBatch?: string;
  prefillClass?: string;
  availableClasses?: string[];
}

const BATCHES = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029'];
const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'ME', 'AIML'];
const DEFAULT_CLASSES = ['Section A', 'Section B'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editStudent,
  adminDept,
  prefillBatch,
  prefillClass,
  availableClasses,
}) => {
  const { addStudent, updateStudent, isRollNoUnique } = useStudents();
  
  // Check if admin is restricted to a specific department
  const isRestrictedAdmin = Boolean(adminDept && adminDept !== 'Overall');
  const allowedDepartments = isRestrictedAdmin ? [adminDept!] : DEPARTMENTS;

  // Check if batch/class are pre-filled (opened from class context)
  const hasPrefillBatch = Boolean(prefillBatch);
  const hasPrefillClass = Boolean(prefillClass);
  
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: editStudent
      ? {
          name: editStudent.name,
          rollNo: editStudent.rollNo,
          batch: editStudent.batch,
          department: editStudent.department,
          class: editStudent.class,
          semester: editStudent.semester,
          email: editStudent.email || '',
          phone: editStudent.phone || '',
        }
      : {
          name: '',
          rollNo: '',
          batch: prefillBatch || '',
          department: isRestrictedAdmin && adminDept ? adminDept : '',
          class: prefillClass || '',
          semester: 1,
          email: '',
          phone: '',
        },
  });

  React.useEffect(() => {
    if (editStudent) {
      reset({
        name: editStudent.name,
        rollNo: editStudent.rollNo,
        batch: editStudent.batch,
        department: editStudent.department,
        class: editStudent.class,
        semester: editStudent.semester,
        email: editStudent.email || '',
        phone: editStudent.phone || '',
      });
    } else {
      reset({
        name: '',
        rollNo: '',
        batch: prefillBatch || '',
        department: isRestrictedAdmin && adminDept ? adminDept : '',
        class: prefillClass || '',
        semester: 1,
        email: '',
        phone: '',
      });
    }
  }, [editStudent, reset, isRestrictedAdmin, adminDept, prefillBatch, prefillClass]);

  const onSubmit = async (data: StudentFormData) => {
    // Check roll number uniqueness
    if (!isRollNoUnique(data.rollNo, editStudent?.id)) {
      setError('rollNo', { message: 'Roll number already exists' });
      return;
    }

    const studentData = {
      name: data.name,
      rollNo: data.rollNo,
      batch: data.batch,
      department: data.department,
      class: data.class,
      semester: data.semester,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };

    if (editStudent) {
      const success = updateStudent(editStudent.id, studentData);
      if (success) {
        onSuccess('Student updated successfully');
        handleClose();
      } else {
        setError('rollNo', { message: 'Failed to update student' });
      }
    } else {
      const result = addStudent(studentData);
      if (result.success) {
        onSuccess(result.message);
        handleClose();
      } else {
        setError('rollNo', { message: result.message });
      }
    }
  };

  const handleClose = () => {
    reset();
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
        <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editStudent ? 'Edit Student' : 'Add New Student'}
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

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Enter student name"
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('rollNo')}
                type="text"
                placeholder="e.g., 21CSE001"
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.rollNo ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.rollNo && (
                <p className="mt-1 text-sm text-red-500">{errors.rollNo.message}</p>
              )}
            </div>

            {/* Batch and Department Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('batch')}
                  disabled={hasPrefillBatch && !editStudent}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.batch ? 'border-red-500' : 'border-gray-200'
                  } ${hasPrefillBatch && !editStudent ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Batch</option>
                  {BATCHES.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
                {errors.batch && (
                  <p className="mt-1 text-sm text-red-500">{errors.batch.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                  {isRestrictedAdmin && (
                    <span className="text-xs text-gray-500 ml-1">(restricted)</span>
                  )}
                </label>
                <select
                  {...register('department')}
                  disabled={isRestrictedAdmin}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.department ? 'border-red-500' : 'border-gray-200'
                  } ${isRestrictedAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  {!isRestrictedAdmin && <option value="">Select Dept</option>}
                  {allowedDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>
                )}
              </div>
            </div>

            {/* Class and Semester Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('class')}
                  disabled={hasPrefillClass && !editStudent}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.class ? 'border-red-500' : 'border-gray-200'
                  } ${hasPrefillClass && !editStudent ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Class</option>
                  {(availableClasses && availableClasses.length > 0
                    ? [...new Set([...DEFAULT_CLASSES, ...availableClasses])].sort()
                    : DEFAULT_CLASSES
                  ).map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                  {/* Include the prefilled class if not already listed */}
                  {prefillClass && !DEFAULT_CLASSES.includes(prefillClass) && !(availableClasses || []).includes(prefillClass) && (
                    <option key={prefillClass} value={prefillClass}>
                      {prefillClass}
                    </option>
                  )}
                </select>
                {errors.class && (
                  <p className="mt-1 text-sm text-red-500">{errors.class.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('semester', { valueAsNumber: true })}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.semester ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="mt-1 text-sm text-red-500">{errors.semester.message}</p>
                )}
              </div>
            </div>

            {/* Email and Phone Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="student@email.com"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="9876543210"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : editStudent ? (
                  'Update Student'
                ) : (
                  'Add Student'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
