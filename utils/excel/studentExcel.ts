import * as XLSX from 'xlsx';
import { AdminStudent } from '@/types';

export interface ParsedStudentRow {
  name: string;
  rollNo: string;
  batch: string;
  department: string;
  class: string;
  semester: number;
  email?: string;
  phone?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_BATCHES = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029'];
const VALID_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'ME', 'AIML'];

export const validateStudentRow = (row: Record<string, unknown>, rowIndex: number): ValidationResult => {
  const errors: string[] = [];

  // Check required fields
  if (!row.name || String(row.name).trim() === '') {
    errors.push(`Row ${rowIndex + 1}: Name is required`);
  }

  if (!row.rollNo || String(row.rollNo).trim() === '') {
    errors.push(`Row ${rowIndex + 1}: Roll Number is required`);
  }

  if (!row.batch || String(row.batch).trim() === '') {
    errors.push(`Row ${rowIndex + 1}: Batch is required`);
  } else if (!VALID_BATCHES.includes(String(row.batch).trim())) {
    errors.push(`Row ${rowIndex + 1}: Invalid batch "${row.batch}". Valid values: ${VALID_BATCHES.join(', ')}`);
  }

  if (!row.department || String(row.department).trim() === '') {
    errors.push(`Row ${rowIndex + 1}: Department is required`);
  } else if (!VALID_DEPARTMENTS.includes(String(row.department).trim().toUpperCase())) {
    errors.push(`Row ${rowIndex + 1}: Invalid department "${row.department}". Valid values: ${VALID_DEPARTMENTS.join(', ')}`);
  }

  if (!row.class || String(row.class).trim() === '') {
    errors.push(`Row ${rowIndex + 1}: Class is required`);
  } else if (!/^Section\s+[A-Z]$/i.test(String(row.class).trim())) {
    errors.push(`Row ${rowIndex + 1}: Invalid class format "${row.class}". Expected format: "Section A", "Section B", "Section C", etc.`);
  }

  if (!row.semester || isNaN(Number(row.semester))) {
    errors.push(`Row ${rowIndex + 1}: Semester must be a number`);
  } else {
    const sem = Number(row.semester);
    if (sem < 1 || sem > 8) {
      errors.push(`Row ${rowIndex + 1}: Semester must be between 1 and 8`);
    }
  }

  // Roll No format validation (batch start year + department code + unique number)
  // Example: batch 2023-2027 + dept CSE => rollNo 23CS004
  if (row.rollNo && row.batch && row.department) {
    const rollNo = String(row.rollNo).trim().toUpperCase();
    const batch = String(row.batch).trim();
    const department = String(row.department).trim().toUpperCase();

    const deptCodeMap: Record<string, string> = {
      CSE: 'CS',
      IT: 'IT',
      ECE: 'EC',
      ME: 'ME',
      AIML: 'AI',
    };

    const expectedDeptCode = deptCodeMap[department];
    const startYear = batch.split('-')[0];
    const expectedYearPrefix = /^\d{4}$/.test(startYear) ? startYear.slice(-2) : null;

    if (expectedYearPrefix && expectedDeptCode) {
      const expectedPrefix = `${expectedYearPrefix}${expectedDeptCode}`;

      if (!rollNo.startsWith(expectedPrefix)) {
        errors.push(
          `Row ${rowIndex + 1}: Roll Number must start with "${expectedPrefix}" for batch ${batch} and dept ${department}`
        );
      } else {
        const suffix = rollNo.slice(expectedPrefix.length);
        if (!/^\d{3,4}$/.test(suffix)) {
          errors.push(
            `Row ${rowIndex + 1}: Roll Number must be in format "${expectedPrefix}###" (last part should be 3-4 digits)`
          );
        }
      }
    }
  }

  // Email validation (optional)
  if (row.email && String(row.email).trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(row.email).trim())) {
      errors.push(`Row ${rowIndex + 1}: Invalid email format`);
    }
  }

  // Phone validation (optional)
  if (row.phone && String(row.phone).trim() !== '') {
    const phoneStr = String(row.phone).replace(/\D/g, '');
    if (phoneStr.length < 10) {
      errors.push(`Row ${rowIndex + 1}: Phone number should be at least 10 digits`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const parseExcelFile = async (file: File): Promise<{
  success: boolean;
  data: ParsedStudentRow[];
  errors: string[];
}> => {
  const isCSV = file.name.toLowerCase().endsWith('.csv');

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let jsonData: Record<string, unknown>[];

        if (isCSV) {
          // Parse CSV natively - strip BOM if present
          let text = e.target?.result as string;
          if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
          }
          const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
          
          if (lines.length < 2) {
            resolve({
              success: false,
              data: [],
              errors: ['CSV file is empty or has no data rows'],
            });
            return;
          }

          const headers = lines[0].split(',').map((h) => h.trim());
          jsonData = lines.slice(1).map((line) => {
            const values = line.split(',').map((v) => v.trim());
            const row: Record<string, unknown> = {};
            headers.forEach((header, i) => {
              row[header] = values[i] ?? '';
            });
            return row;
          });
        } else {
          // Parse Excel with XLSX
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
        }

        if (jsonData.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['File is empty or has no data rows'],
          });
          return;
        }

        const allErrors: string[] = [];
        const parsedStudents: ParsedStudentRow[] = [];

        // Validate each row
        jsonData.forEach((row, index) => {
          const validation = validateStudentRow(row, index);
          
          if (validation.valid) {
            parsedStudents.push({
              name: String(row.name).trim(),
              rollNo: String(row.rollNo).trim(),
              batch: String(row.batch).trim(),
              department: String(row.department).trim().toUpperCase(),
              class: String(row.class).trim(),
              semester: Number(row.semester),
              email: row.email ? String(row.email).trim() : undefined,
              phone: row.phone ? String(row.phone).toString().trim() : undefined,
            });
          } else {
            allErrors.push(...validation.errors);
          }
        });

        resolve({
          success: allErrors.length === 0,
          data: parsedStudents,
          errors: allErrors,
        });
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Failed to read file'],
      });
    };

    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

export const generateSampleTemplate = (): void => {
  const sampleData = [
    {
      name: 'John Doe',
      rollNo: '21CSE001',
      batch: '2021-2025',
      department: 'CSE',
      class: 'Section A',
      semester: 5,
      email: 'john@example.com',
      phone: '9876543210',
    },
    {
      name: 'Jane Smith',
      rollNo: '21CSE002',
      batch: '2021-2025',
      department: 'CSE',
      class: 'Section A',
      semester: 5,
      email: 'jane@example.com',
      phone: '9876543211',
    },
    {
      name: 'Bob Wilson',
      rollNo: '22IT001',
      batch: '2022-2026',
      department: 'IT',
      class: 'Section B',
      semester: 3,
      email: '',
      phone: '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // name
    { wch: 12 }, // rollNo
    { wch: 12 }, // batch
    { wch: 12 }, // department
    { wch: 12 }, // class
    { wch: 10 }, // semester
    { wch: 25 }, // email
    { wch: 15 }, // phone
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

  // Download
  XLSX.writeFile(workbook, 'student_template.xlsx');
};

export const exportStudentsToCSV = (students: AdminStudent[]): void => {
  const headers = ['Name', 'Roll No', 'Batch', 'Department', 'Class', 'Semester', 'Email', 'Phone'];
  const rows = students.map((s) => [
    s.name,
    s.rollNo,
    s.batch,
    s.department,
    s.class,
    s.semester,
    s.email || '',
    s.phone || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportStudentsToExcel = (students: AdminStudent[]): void => {
  const exportData = students.map((s) => ({
    name: s.name,
    rollNo: s.rollNo,
    batch: s.batch,
    department: s.department,
    class: s.class,
    semester: s.semester,
    email: s.email || '',
    phone: s.phone || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 25 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

  XLSX.writeFile(workbook, `students-${new Date().toISOString().split('T')[0]}.xlsx`);
};
