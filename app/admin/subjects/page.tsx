"use client";

import { useState, useEffect } from "react";
import { ManagedSubject, Department } from "@/types";
import { getBatches, getDepartments } from "@/data/mockDatabase";
import { useSemesters } from "@/hooks/useSemesters";
import { useSubjects } from "@/hooks/useSubjects";
import { SemesterSelector } from "@/components/SemesterSelector";
import { SubjectForm } from "@/components/SubjectForm";
import { SubjectList } from "@/components/SubjectList";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLayout } from "@/components/PageLayout";

export default function AdminSubjectsPage() {
  const mockBatches = getBatches();
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ManagedSubject | null>(null);

  // Get departments for selected batch
  const [availableDepts, setAvailableDepts] = useState<Department[]>([]);
  useEffect(() => {
    if (selectedBatch) {
      setAvailableDepts(getDepartments(selectedBatch));
    } else {
      setAvailableDepts([]);
    }
  }, [selectedBatch]);

  // Get classes for selected department
  const selectedDeptData = availableDepts.find((d) => d.id === selectedDept);
  const availableClasses = selectedDeptData?.classes || [];

  // Use hooks for semester and subject management
  const {
    semesters,
    loading: semestersLoading,
    error: semestersError,
    loadSemesters,
    addSemester,
    removeSemester: deleteSemesterFn,
  } = useSemesters(selectedBatch, selectedDept);

  const {
    subjects,
    loading: subjectsLoading,
    error: subjectsError,
    loadSubjects,
    addSubject: addSubjectFn,
    editSubject: editSubjectFn,
    removeSubject: deleteSubjectFn,
    checkCodeUniqueness,
  } = useSubjects(selectedSemester);

  // Load semesters when batch and dept change
  useEffect(() => {
    if (selectedBatch && selectedDept) {
      loadSemesters(selectedBatch, selectedDept);
      setSelectedSemester(""); // Reset semester selection
    }
  }, [selectedBatch, selectedDept, loadSemesters]);

  // Load subjects when semester changes
  useEffect(() => {
    if (selectedSemester) {
      loadSubjects(selectedSemester);
    }
  }, [selectedSemester, loadSubjects]);

  // Handle semester creation
  const handleCreateSemester = (semesterData: any) => {
    const newSemester = addSemester(semesterData);
    if (newSemester) {
      setSelectedSemester(newSemester.id);
    }
  };

  // Handle subject addition
  const handleAddSubject = (subjectData: Omit<ManagedSubject, "id" | "createdAt" | "updatedAt">) => {
    const newSubject = addSubjectFn(subjectData);
    if (newSubject) {
      setShowFormModal(false);
      setEditingSubject(null);
    }
  };

  // Handle subject editing
  const handleEditSubject = (subject: ManagedSubject) => {
    setEditingSubject(subject);
    setShowFormModal(true);
  };

  // Handle subject update
  const handleUpdateSubject = (subjectData: Omit<ManagedSubject, "id" | "createdAt" | "updatedAt">) => {
    if (editingSubject) {
      editSubjectFn(editingSubject.id, subjectData, selectedSemester);
      setShowFormModal(false);
      setEditingSubject(null);
    }
  };

  // Handle subject deletion
  const handleDeleteSubject = (subjectId: string) => {
    deleteSubjectFn(subjectId, selectedSemester);
    setShowFormModal(false);
    setEditingSubject(null);
  };

  const isLoading = semestersLoading || subjectsLoading;
  const canManageSubjects = selectedBatch && selectedDept && selectedSemester;

  return (
    <PageLayout title="Subject Management">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">📚 Subject Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage subjects for semesters across batches and departments
          </p>
        </div>

        {/* Semester Selector */}
        <SemesterSelector
          batches={mockBatches}
          departments={availableDepts}
          semesters={semesters}
          selectedBatch={selectedBatch}
          selectedDept={selectedDept}
          selectedSemester={selectedSemester}
          onBatchChange={setSelectedBatch}
          onDeptChange={setSelectedDept}
          onSemesterChange={setSelectedSemester}
          onCreateSemester={handleCreateSemester}
          isLoading={isLoading}
        />

        {/* Error Messages */}
        {semestersError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {semestersError}
          </div>
        )}
        {subjectsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {subjectsError}
          </div>
        )}

        {/* Subjects Management Section */}
        {canManageSubjects && (
          <>
            {/* Toolbar */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Subjects for Selected Semester</h2>
              <Button
                onClick={() => {
                  setEditingSubject(null);
                  setShowFormModal(true);
                }}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                + Add New Subject
              </Button>
            </div>

            {/* Statistics Card */}
            {subjects.length > 0 && (
              <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                  <div>
                    <p className="text-sm text-gray-600">Total Subjects</p>
                    <p className="text-2xl font-bold">{subjects.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Credits</p>
                    <p className="text-2xl font-bold">
                      {subjects.reduce((acc, s) => acc + s.credits, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Classes Covered</p>
                    <p className="text-2xl font-bold">
                      {new Set(subjects.flatMap((s) => s.classesAssigned)).size}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subjects with Faculty</p>
                    <p className="text-2xl font-bold">
                      {subjects.filter((s) => s.faculty).length}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && <LoadingSpinner message="Loading subjects..." />}

            {/* Subjects Table */}
            {!isLoading && (
              <SubjectList
                subjects={subjects}
                onEdit={handleEditSubject}
                onDelete={handleDeleteSubject}
                isLoading={isLoading}
                emptyMessage="No subjects yet. Create one to get started!"
              />
            )}
          </>
        )}

        {/* Empty State - No Context Selected */}
        {!canManageSubjects && (
          <Card>
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                Please select a Batch, Department, and Semester to manage subjects
              </p>
            </div>
          </Card>
        )}

        {/* Subject Form Modal */}
        {showFormModal && canManageSubjects && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-h-[90vh] overflow-y-auto">
              <SubjectForm
                onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject}
                onCancel={() => {
                  setShowFormModal(false);
                  setEditingSubject(null);
                }}
                onDelete={editingSubject ? handleDeleteSubject : undefined}
                initialSubject={editingSubject || undefined}
                classes={availableClasses}
                isLoading={isLoading}
                semesterId={selectedSemester}
                departmentId={selectedDept}
                checkCodeUniqueness={(code, excludeId) =>
                  checkCodeUniqueness(code, selectedSemester, excludeId)
                }
              />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
