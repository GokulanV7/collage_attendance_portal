"use client";

import React from "react";
import { ManagedSubject } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

interface SubjectListProps {
  subjects: ManagedSubject[];
  onEdit: (subject: ManagedSubject) => void;
  onDelete: (subjectId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = "No subjects found",
}) => {
  if (subjects.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Credits</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Faculty</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Classes</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Periods</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, idx) => (
              <tr key={subject.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 text-sm font-medium">{subject.code}</td>
                <td className="px-6 py-4 text-sm">{subject.name}</td>
                <td className="px-6 py-4 text-sm text-center">{subject.credits}</td>
                <td className="px-6 py-4 text-sm">{subject.faculty || "-"}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {subject.classesAssigned.map((cls) => (
                      <span key={cls} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {cls}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {subject.periods && subject.periods.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {subject.periods.map((period) => (
                        <span key={period.id} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {period.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => onEdit(subject)}
                      disabled={isLoading}
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm(`Delete subject ${subject.code}?`)) {
                          onDelete(subject.id);
                        }
                      }}
                      disabled={isLoading}
                      variant="outline"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
