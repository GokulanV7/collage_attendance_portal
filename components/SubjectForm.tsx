"use client";

import React, { useState } from "react";
import { ManagedSubject, Class } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/Checkbox";
import { PERIOD_CONFIG_45MIN, PERIOD_CONFIG_1HOUR } from "@/data/periodConfigs";

interface SubjectFormProps {
  onSubmit: (subject: Omit<ManagedSubject, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  onDelete?: (subjectId: string) => void;
  initialSubject?: ManagedSubject;
  classes: Class[];
  isLoading?: boolean;
  semesterId: string;
  departmentId: string;
  checkCodeUniqueness: (code: string, excludeId?: string) => boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  onSubmit,
  onCancel,
  onDelete,
  initialSubject,
  classes,
  isLoading = false,
  semesterId,
  departmentId,
  checkCodeUniqueness,
}) => {
  const [formData, setFormData] = useState({
    code: initialSubject?.code || "",
    name: initialSubject?.name || "",
    credits: initialSubject?.credits || 3,
    faculty: initialSubject?.faculty || "",
    classesAssigned: initialSubject?.classesAssigned || [],
    periods: initialSubject?.periods || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get all available periods from both configs
  const allPeriods = [...PERIOD_CONFIG_45MIN.periods, ...PERIOD_CONFIG_1HOUR.periods];
  const uniquePeriods = Array.from(new Map(allPeriods.map((p) => [p.id, p])).values());

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Subject code is required";
    } else if (!checkCodeUniqueness(formData.code, initialSubject?.id)) {
      newErrors.code = "Subject code must be unique per semester";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Subject name is required";
    }

    if (formData.credits < 1 || formData.credits > 4) {
      newErrors.credits = "Credits must be between 1 and 4";
    }

    if (formData.classesAssigned.length === 0) {
      newErrors.classes = "At least one class must be assigned";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      semesterId,
      departmentId,
    });
  };

  const handleClassToggle = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      classesAssigned: prev.classesAssigned.includes(classId)
        ? prev.classesAssigned.filter((c) => c !== classId)
        : [...prev.classesAssigned, classId],
    }));
  };

  const handlePeriodToggle = (periodId: number) => {
    const period = uniquePeriods.find((p) => p.id === periodId);
    if (!period) return;

    setFormData((prev) => ({
      ...prev,
      periods: prev.periods?.some((p) => p.id === periodId)
        ? prev.periods.filter((p) => p.id !== periodId)
        : [...(prev.periods || []), period],
    }));
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {initialSubject ? "Edit Subject" : "Create New Subject"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Field */}
            <div>
              <Input
                label="Subject Code *"
                value={formData.code}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, code: val.toUpperCase() }));
                  setErrors((prev) => ({ ...prev, code: "" }));
                }}
                placeholder="e.g., CS301"
                disabled={isLoading}
                error={errors.code}
              />
            </div>

            {/* Name Field */}
            <div>
              <Input
                label="Subject Name *"
                value={formData.name}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, name: val }));
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g., Operating Systems"
                disabled={isLoading}
                error={errors.name}
              />
            </div>

            {/* Credits Field */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Credits *"
                  type="number"
                  value={formData.credits.toString()}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, credits: parseInt(val) || 3 }));
                    setErrors((prev) => ({ ...prev, credits: "" }));
                  }}
                  min={1}
                  max={4}
                  disabled={isLoading}
                  error={errors.credits}
                />
              </div>

              {/* Faculty Field */}
              <div>
                <Input
                  label="Faculty (Optional)"
                  value={formData.faculty}
                  onChange={(val) => setFormData((prev) => ({ ...prev, faculty: val }))}
                  placeholder="e.g., Dr. Smith"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Classes Assignment */}
            <div>
              <label className="block text-sm font-medium mb-3">Assign to Classes *</label>
              <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                {classes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No classes available</p>
                ) : (
                  classes.map((cls) => (
                    <Checkbox
                      key={cls.id}
                      label={`${cls.name} (${cls.students.length} students)`}
                      checked={formData.classesAssigned.includes(cls.id)}
                      onChange={() => handleClassToggle(cls.id)}
                    />
                  ))
                )}
              </div>
              {errors.classes && <p className="text-red-600 text-sm mt-2">{errors.classes}</p>}
            </div>

            {/* Time Periods Assignment */}
            <div>
              <label className="block text-sm font-medium mb-3">Assign Time Periods (Optional)</label>
              <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                {uniquePeriods.map((period) => (
                  <Checkbox
                    key={period.id}
                    label={`${period.name} (${period.startTime} - ${period.endTime})`}
                    checked={formData.periods?.some((p) => p.id === period.id) || false}
                    onChange={() => handlePeriodToggle(period.id)}
                  />
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : initialSubject ? "Update Subject" : "Create Subject"}
              </Button>
              <Button
                onClick={onCancel}
                disabled={isLoading}
                variant="outline"
              >
                Cancel
              </Button>
              {initialSubject && onDelete && (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && initialSubject && onDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{initialSubject.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    onDelete(initialSubject.id);
                    setShowDeleteConfirm(false);
                  }}
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
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
