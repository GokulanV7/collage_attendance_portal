"use client";

import React, { useState } from "react";
import { Batch, Department, Semester } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { Input } from "@/components/Input";

interface SemesterSelectorProps {
  batches: Batch[];
  departments: Department[];
  semesters: Semester[];
  selectedBatch?: string;
  selectedDept?: string;
  selectedSemester?: string;
  onBatchChange: (batchId: string) => void;
  onDeptChange: (deptId: string) => void;
  onSemesterChange: (semesterId: string) => void;
  onCreateSemester: (semester: Omit<Semester, "id" | "createdAt" | "updatedAt">) => void;
  isLoading?: boolean;
}

export const SemesterSelector: React.FC<SemesterSelectorProps> = ({
  batches,
  departments,
  semesters,
  selectedBatch,
  selectedDept,
  selectedSemester,
  onBatchChange,
  onDeptChange,
  onSemesterChange,
  onCreateSemester,
  isLoading = false,
}) => {
  const [showCreateSemester, setShowCreateSemester] = useState(false);
  const [newSemesterData, setNewSemesterData] = useState({
    name: "",
    year: 1,
    startDate: "",
    endDate: "",
  });

  const handleCreateSemester = () => {
    if (!selectedBatch || !selectedDept || !newSemesterData.name || !newSemesterData.startDate || !newSemesterData.endDate) {
      alert("Please fill all required fields");
      return;
    }

    onCreateSemester({
      name: newSemesterData.name,
      batchId: selectedBatch,
      departmentId: selectedDept,
      year: newSemesterData.year,
      startDate: newSemesterData.startDate,
      endDate: newSemesterData.endDate,
    });

    setNewSemesterData({ name: "", year: 1, startDate: "", endDate: "" });
    setShowCreateSemester(false);
  };

  const batchLabel = batches.find((b) => b.id === selectedBatch)?.name;
  const deptLabel = departments.find((d) => d.id === selectedDept)?.name;

  return (
    <>
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Select Context</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Batch Selection */}
            <Select
              label="Batch *"
              value={selectedBatch || ""}
              onChange={onBatchChange}
              options={batches.map((batch) => ({
                id: batch.id,
                name: batch.name,
              }))}
              placeholder="-- Select Batch --"
            />

            {/* Department Selection */}
            <Select
              label="Department *"
              value={selectedDept || ""}
              onChange={onDeptChange}
              options={departments.map((dept) => ({
                id: dept.id,
                name: dept.name,
              }))}
              placeholder="-- Select Department --"
            />

            {/* Semester Selection */}
            <div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    label="Semester *"
                    value={selectedSemester || ""}
                    onChange={onSemesterChange}
                    options={semesters.map((sem) => ({
                      id: sem.id,
                      name: `${sem.name} (Year ${sem.year})`,
                    }))}
                    placeholder="-- Select Semester --"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={() => setShowCreateSemester(true)}
                    disabled={!selectedBatch || !selectedDept || isLoading}
                    className="whitespace-nowrap"
                  >
                    + New
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {selectedBatch && selectedDept && selectedSemester && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p>
                <strong>Context:</strong> {batchLabel} • {deptLabel} • {semesters.find((s) => s.id === selectedSemester)?.name}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Create Semester Modal */}
      {showCreateSemester && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Create New Semester</h3>

              <div className="space-y-4 mb-6">
                {/* Semester Name */}
                <Input
                  label="Semester Name *"
                  type="text"
                  value={newSemesterData.name}
                  onChange={(val) =>
                    setNewSemesterData((prev) => ({ ...prev, name: val }))
                  }
                  placeholder="e.g., Semester 3"
                  required
                />

                {/* Year */}
                <Select
                  label="Year *"
                  value={newSemesterData.year.toString()}
                  onChange={(val) =>
                    setNewSemesterData((prev) => ({ ...prev, year: parseInt(val) }))
                  }
                  options={[
                    { id: "1", name: "Year 1" },
                    { id: "2", name: "Year 2" },
                    { id: "3", name: "Year 3" },
                    { id: "4", name: "Year 4" },
                  ]}
                  required
                />

                {/* Start Date */}
                <Input
                  label="Start Date *"
                  type="text"
                  value={newSemesterData.startDate}
                  onChange={(val) =>
                    setNewSemesterData((prev) => ({ ...prev, startDate: val }))
                  }
                  placeholder="YYYY-MM-DD"
                  required
                />

                {/* End Date */}
                <Input
                  label="End Date *"
                  type="text"
                  value={newSemesterData.endDate}
                  onChange={(val) =>
                    setNewSemesterData((prev) => ({ ...prev, endDate: val }))
                  }
                  placeholder="YYYY-MM-DD"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateSemester}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create
                </Button>
                <Button
                  onClick={() => setShowCreateSemester(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
