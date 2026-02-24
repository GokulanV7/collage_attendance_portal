'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { safeSessionStorage } from '@/utils/safeSessionStorage';
import { getStaffData, addStaff, removeStaff } from '@/data/mockStaffAndPeriods';
import { Staff } from '@/types';

export default function ManageStaffPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [adminDept, setAdminDept] = useState<string>('');
  const [adminDeptName, setAdminDeptName] = useState<string>('');

  // Form state
  const [staffId, setStaffId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    // Load only this department's staff
    const all = getStaffData();
    setStaffList(all.filter((s) => s.department.toUpperCase() === dept.toUpperCase()));
  }, [router]);

  const handleAdd = () => {
    setFormError('');
    const trimId = staffId.trim().toUpperCase();
    const trimName = staffName.trim();

    if (!trimId) {
      setFormError('Staff ID is required');
      return;
    }
    if (!trimName) {
      setFormError('Staff Name is required');
      return;
    }
    // Check across ALL staff (not just current dept) to avoid duplicate IDs
    const allStaff = getStaffData();
    if (allStaff.some((s) => s.id.toUpperCase() === trimId)) {
      setFormError('Staff ID already exists');
      return;
    }

    const updated = addStaff({ id: trimId, name: trimName, department: adminDept });
    setStaffList(updated.filter((s) => s.department.toUpperCase() === adminDept.toUpperCase()));
    setStaffId('');
    setStaffName('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = removeStaff(id);
    setStaffList(updated.filter((s) => s.department.toUpperCase() === adminDept.toUpperCase()));
    setDeleteId(null);
  };

  const filtered = staffList.filter((s) => {
    const matchesSearch =
      !search ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Staff — {adminDeptName || adminDept}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {staffList.length} staff member{staffList.length !== 1 ? 's' : ''} in {adminDept}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0E8C3A] text-white rounded-lg hover:bg-[#0E8C3A]/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Staff
          </button>
        </div>

        {/* Add Staff Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Staff</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
                <input
                  type="text"
                  value={staffId}
                  onChange={(e) => { setStaffId(e.target.value); setFormError(''); }}
                  placeholder="e.g. STAFF013"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => { setStaffName(e.target.value); setFormError(''); }}
                  placeholder="e.g. Dr. John Doe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                  {adminDept}
                </div>
              </div>
            </div>
            {formError && (
              <p className="mt-3 text-sm text-red-600">{formError}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAdd}
                className="px-5 py-2 bg-[#0E8C3A] text-white rounded-lg hover:bg-[#0E8C3A]/90 transition-colors text-sm font-medium"
              >
                Add Staff
              </button>
              <button
                onClick={() => { setShowForm(false); setFormError(''); }}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5F000] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Staff ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length > 0 ? (
                  filtered.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {staff.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#0E8C3A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {staff.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-medium text-gray-900">{staff.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {staff.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {deleteId === staff.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDelete(staff.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(staff.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete staff"
                          >
                            <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No staff members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay (for mobile tap safety) */}
    </AdminLayout>
  );
}
