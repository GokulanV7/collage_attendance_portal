'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { AddStudentModal, ExcelUploadModal, DeleteConfirmModal } from '@/components/admin/students';
import { useStudents } from '@/context/StudentsContext';
import { AdminStudent } from '@/types';
import { safeSessionStorage } from '@/utils/safeSessionStorage';
import { getBatches } from '@/data/mockDatabase';
import { generateSampleTemplate, exportStudentsToExcel } from '@/utils/excel/studentExcel';

type View = 'classes' | 'students';

const PAGE_SIZE = 10;
const CLASS_STORAGE_KEY = 'admin_class_names';

const DEFAULT_CLASS = 'Section A';

// Helper to get/save manually created class names
const getCreatedClasses = (batch: string, dept: string): string[] => {
  try {
    const stored = safeSessionStorage.getItem(CLASS_STORAGE_KEY);
    if (!stored) return [];
    const all = JSON.parse(stored) as Record<string, string[]>;
    return all[`${batch}_${dept}`] || [];
  } catch {
    return [];
  }
};

const saveCreatedClass = (batch: string, dept: string, className: string) => {
  try {
    const stored = safeSessionStorage.getItem(CLASS_STORAGE_KEY);
    const all = stored ? (JSON.parse(stored) as Record<string, string[]>) : {};
    const key = `${batch}_${dept}`;
    const list = all[key] || [];
    if (!list.includes(className)) {
      list.push(className);
      all[key] = list;
      safeSessionStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(all));
    }
  } catch {}
};

const removeCreatedClass = (batch: string, dept: string, className: string) => {
  try {
    const stored = safeSessionStorage.getItem(CLASS_STORAGE_KEY);
    if (!stored) return;
    const all = JSON.parse(stored) as Record<string, string[]>;
    const key = `${batch}_${dept}`;
    const list = all[key] || [];
    all[key] = list.filter((c) => c !== className);
    safeSessionStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(all));
  } catch {}
};

export default function StudentsPage() {
  const router = useRouter();
  const { students, loading, deleteStudent } = useStudents();

  const [adminDept, setAdminDept] = useState<string>('');
  const [adminDeptName, setAdminDeptName] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('classes');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Create class state
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [classError, setClassError] = useState('');
  const [createdClassList, setCreatedClassList] = useState<string[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editStudent, setEditStudent] = useState<AdminStudent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminStudent | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const batches = getBatches();

  useEffect(() => {
    const isAdmin = safeSessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/admin/login');
      return;
    }
    const dept = safeSessionStorage.getItem('adminDeptId') || '';
    const deptName = safeSessionStorage.getItem('adminDeptName') || dept;
    setAdminDept(dept);
    setAdminDeptName(deptName);
    if (batches.length > 0) setSelectedBatch(batches[0].id);
  }, [router]);

  // Reload created classes whenever batch changes
  useEffect(() => {
    if (selectedBatch && adminDept) {
      setCreatedClassList(getCreatedClasses(selectedBatch, adminDept));
    }
  }, [selectedBatch, adminDept]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Students for this department + batch
  const batchStudents = useMemo(() => {
    if (!adminDept || !selectedBatch) return [];
    return students.filter(
      (s) => s.department.toUpperCase() === adminDept.toUpperCase() && s.batch === selectedBatch
    );
  }, [students, adminDept, selectedBatch]);

  // Delete class state
  const [deleteClassTarget, setDeleteClassTarget] = useState<string | null>(null);

  // Derive unique class names from students + manually created classes + default
  const classNames = useMemo(() => {
    const fromStudents = [...new Set(batchStudents.map((s) => s.class))];
    const merged = [...new Set([DEFAULT_CLASS, ...fromStudents, ...createdClassList])].sort();
    return merged;
  }, [batchStudents, createdClassList]);

  // Students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    let filtered = batchStudents.filter((s) => s.class === selectedClass);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
    return filtered;
  }, [batchStudents, selectedClass, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(classStudents.length / PAGE_SIZE));
  const paginatedStudents = classStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // --- Handlers ---
  const handleSelectClass = (cls: string) => {
    setSelectedClass(cls);
    setCurrentView('students');
    setSearch('');
    setCurrentPage(1);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setCurrentView('classes');
    setSearch('');
  };

  const handleCreateClass = () => {
    setClassError('');
    const trimmed = newClassName.trim();
    if (!trimmed) {
      setClassError('Class name is required');
      return;
    }
    if (classNames.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setClassError('Class already exists');
      return;
    }
    saveCreatedClass(selectedBatch, adminDept, trimmed);
    setCreatedClassList(getCreatedClasses(selectedBatch, adminDept));
    setNewClassName('');
    setShowCreateClass(false);
    showToast(`Class "${trimmed}" created`);
  };

  const handleDeleteClass = (cls: string) => {
    const studentsInClass = batchStudents.filter((s) => s.class === cls);
    // Delete all students in this class
    studentsInClass.forEach((s) => deleteStudent(s.id));
    // Remove from created classes list
    removeCreatedClass(selectedBatch, adminDept, cls);
    setCreatedClassList(getCreatedClasses(selectedBatch, adminDept));
    setDeleteClassTarget(null);
    showToast(`Class "${cls}" deleted`);
  };

  const handleEdit = (student: AdminStudent) => {
    setEditStudent(student);
    setShowAddModal(true);
  };

  const handleDelete = (student: AdminStudent) => {
    setDeleteTarget(student);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteStudent(deleteTarget.id);
      showToast(`${deleteTarget.name} deleted successfully`);
      setDeleteTarget(null);
    }
  };

  if (!adminDept || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-[#D5F000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        )}

        {/* Page Header with Batch Selector */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
            <p className="text-sm text-gray-500 mt-1">{adminDeptName}</p>

            {/* Breadcrumb */}
            {currentView === 'students' && selectedClass && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <button
                  onClick={handleBackToClasses}
                  className="text-[#0E8C3A] hover:underline font-medium"
                >
                  {adminDept} - Classes
                </button>
                <span className="text-gray-400">›</span>
                <span className="text-gray-700 font-medium">{selectedClass}</span>
              </div>
            )}
            {currentView === 'classes' && (
              <p className="text-sm text-gray-500 mt-1">{adminDept} - Classes</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500 font-medium">Batch:</label>
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setSelectedClass(null);
                setCurrentView('classes');
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ========== CLASSES VIEW ========== */}
        {currentView === 'classes' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classNames.map((cls) => {
                const count = batchStudents.filter((s) => s.class === cls).length;
                const isDefault = cls === DEFAULT_CLASS;
                const isDeleting = deleteClassTarget === cls;

                return (
                  <div
                    key={cls}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#D5F000] transition-all group relative"
                  >
                    {/* Delete confirmation overlay */}
                    {isDeleting && (
                      <div className="absolute inset-0 bg-white/95 rounded-xl z-10 flex flex-col items-center justify-center p-4">
                        <p className="text-sm text-gray-700 text-center mb-1 font-medium">Delete &quot;{cls}&quot;?</p>
                        {count > 0 && (
                          <p className="text-xs text-red-500 mb-3 text-center">{count} student{count !== 1 ? 's' : ''} will be removed</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteClass(cls)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteClassTarget(null)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleSelectClass(cls)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#D5F000]/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#0E8C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{cls}</h3>
                            <p className="text-xs text-gray-500">{adminDept} • {selectedBatch}</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-[#0E8C3A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="mt-4">
                        {count > 0 ? (
                          <p className="text-sm text-gray-600">{count} student{count !== 1 ? 's' : ''}</p>
                        ) : (
                          <p className="text-sm text-gray-400">No students yet</p>
                        )}
                      </div>
                    </button>

                    {/* Delete button (not on default class) */}
                    {!isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteClassTarget(cls); }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete class"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Create Class Card */}
              {!showCreateClass ? (
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 text-left hover:border-[#0E8C3A] hover:bg-[#D5F000]/5 transition-all flex flex-col items-center justify-center min-h-[130px]"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Create Class</p>
                </button>
              ) : (
                <div className="bg-white rounded-xl border-2 border-[#0E8C3A] p-5">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">New Class</h4>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => { setNewClassName(e.target.value); setClassError(''); }}
                    placeholder="e.g. Section A"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm mb-2"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreateClass(); if (e.key === 'Escape') { setShowCreateClass(false); setNewClassName(''); setClassError(''); } }}
                  />
                  {classError && <p className="text-xs text-red-500 mb-2">{classError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateClass}
                      className="flex-1 px-3 py-1.5 bg-[#0E8C3A] text-white rounded-lg text-sm hover:bg-[#0E8C3A]/90 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => { setShowCreateClass(false); setNewClassName(''); setClassError(''); }}
                      className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {classNames.length === 0 && !showCreateClass && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Classes Yet</h3>
                <p className="text-gray-500 mb-4">Create your first class for {adminDept} — {selectedBatch}</p>
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="px-5 py-2 bg-[#0E8C3A] text-white rounded-lg hover:bg-[#0E8C3A]/90 transition-colors"
                >
                  Create Class
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========== STUDENTS VIEW (inside a class) ========== */}
        {currentView === 'students' && selectedClass && (
          <div className="space-y-4">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToClasses}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Back to classes"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedClass}</h2>
                  <p className="text-xs text-gray-500">{classStudents.length} student{classStudents.length !== 1 ? 's' : ''} • {adminDept} • {selectedBatch}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => generateSampleTemplate()}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Excel Template
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Excel
                </button>
                <button
                  onClick={() => {
                    setEditStudent(null);
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#0E8C3A] text-white rounded-lg hover:bg-[#0E8C3A]/90 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Student
                </button>
              </div>
            </div>

            {/* Search + Export */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                      placeholder="Search by name, roll no, or email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportStudentsToExcel(classStudents)}
                    disabled={classStudents.length === 0}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Export Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {classStudents.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Roll No
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Semester
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#0E8C3A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="font-medium text-gray-900">{student.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">
                              {student.rollNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                              {student.semester}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.email || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.phone || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(student)}
                                  className="p-2 text-[#0E8C3A] hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(student)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
                        {Math.min(currentPage * PAGE_SIZE, classStudents.length)} of{' '}
                        {classStudents.length} students
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Prev
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-600">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Students in {selectedClass}</h3>
                  <p className="text-gray-500 mb-4">Add students to this class to get started</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Upload Excel
                    </button>
                    <button
                      onClick={() => { setEditStudent(null); setShowAddModal(true); }}
                      className="px-4 py-2 bg-[#0E8C3A] text-white rounded-lg hover:bg-[#0E8C3A]/90 transition-colors"
                    >
                      Add Student
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setEditStudent(null); }}
          onSuccess={showToast}
          editStudent={editStudent}
          adminDept={adminDept}
          prefillBatch={selectedBatch}
          prefillClass={selectedClass || undefined}
          availableClasses={classNames}
        />

        <ExcelUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={showToast}
          adminDept={adminDept}
          prefillBatch={selectedBatch}
          prefillClass={selectedClass || undefined}
        />

        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          student={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
}
