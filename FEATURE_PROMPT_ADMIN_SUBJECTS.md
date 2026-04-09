# 📚 Feature Prompt: Admin Subject Management for Semesters

## 🎯 Project Workflow Analysis

### Current System Architecture

**Tech Stack:**

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS + Custom Theme
- **State Management:** React Context (SessionStorage), React Hooks
- **Storage:** localStorage/sessionStorage (client-side only, no backend)
- **UI Components:** Custom component library (Button, Card, Select, Input, etc.)

### Current Application Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    CURRENT ATTENDANCE FLOW                      │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1: SELECTION                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Select Batch (2021-2025, 2022-2026, 2023-2027)          │  │
│  │ Select Department (CSE, IT, ECE, etc.)                   │  │
│  │ Select Class (Class A, Class B based on dept)            │  │
│  │ [Proceed Button] ──────────────────────────────────────→ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  STEP 2: MARK ATTENDANCE                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Students List (dynamically loaded)                       │  │
│  │ Staff ID + Name (input)                                  │  │
│  │ Summary Stats (Total, Present, Absent)                   │  │
│  │ [Submit] ──────────────────────────────────────────────→ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  STEP 3: CONFIRMATION                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Success Message ✓                                        │  │
│  │ Submission Details (Date, Time, Staff)                   │  │
│  │ Absent Students (if any)                                 │  │
│  │ [Mark New Attendance] ────────────────────────────────→  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Data Hierarchy (Current)

```
Batch (2021-2025, 2022-2026, 2023-2027)
  ├── Department (CSE, IT, ECE, Civil, etc.)
  │     ├── Class A
  │     │     └── Students (10 each)
  │     └── Class B
  │           └── Students (10 each)
  │
Period Config (Time-based)
  ├── Period 1: 09:00 - 09:50
  ├── Period 2: 09:50 - 10:40
  ├── Period 3: 10:50 - 11:40
  ├── Period 4: 11:40 - 12:30
  └── ... (6-7 periods total)

Attendance Records (localStorage)
  ├── StudentId + SubjectId + Date + Time
  └── Duplicate prevention enabled
```

---

## 🆕 NEW FEATURE: Admin Subject Management for Semesters

### Feature Overview

Admin users need a dedicated interface to **create, manage, and organize subjects** for each semester within a batch-department combination. This includes:

- Creating subjects with code and name
- Assigning subjects to semesters
- Linking subjects to time periods/slots
- Managing subject-to-class assignments

---

## 📋 Detailed Feature Requirements

### 1. **Data Structure (Add to types/index.ts)**

```typescript
export interface Semester {
  id: string;
  name: string; // "Semester 1", "Semester 2", etc.
  batchId: string; // Reference to batch
  departmentId: string; // Reference to department
  year: number; // 1, 2, 3, 4
  startDate: string; // "2024-01-15"
  endDate: string; // "2024-05-30"
}

export interface Subject {
  id: string;
  code: string; // "CS101", "CS102"
  name: string; // "Data Structures", "Database"
  semesterId: string; // Reference to semester
  credits: number; // 3, 4
  departmentId: string; // Reference to department
  faculty?: string; // Optional faculty name
  periods?: Period[]; // Assigned time slots
  classesAssigned: string[]; // ["ClassA", "ClassB"]
}

export interface ClassSubjectMapping {
  id: string;
  classId: string;
  subjectId: string;
  semesterId: string;
  isActive: boolean;
}
```

---

## 🎨 UI/UX Flow for Admin Subject Manager

```
┌────────────────────────────────────────────────────┐
│          ADMIN DASHBOARD (Main Route)              │
│  /admin/login → /admin/view                        │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌─ NEW: /admin/subjects/manage ─────────────────┐│
│  │                                                ││
│  │  📚 SUBJECT MANAGEMENT                        ││
│  │  ════════════════════════════════════════     ││
│  │                                                ││
│  │  Step 1: SELECT CONTEXT                       ││
│  │  ┌──────────────────────────────────────────┐ ││
│  │  │ Batch:       [Select Dropdown]           │ ││
│  │  │ Department:  [Select Dropdown]           │ ││
│  │  │ Semester:    [Select Dropdown / Create]  │ ││
│  │  │ [Next →]                                 │ ││
│  │  └──────────────────────────────────────────┘ ││
│  │                                                ││
│  │  ↓                                             ││
│  │                                                ││
│  │  Step 2: MANAGE SUBJECTS FOR SEMESTER        ││
│  │  ┌──────────────────────────────────────────┐ ││
│  │  │ Batch: 2023-2027 | Dept: CSE             │ ││
│  │  │ Semester: 3 (2024-2025)                  │ ││
│  │  │ [Add New Subject +]                      │ ││
│  │  └──────────────────────────────────────────┘ ││
│  │                                                ││
│  │  📋 EXISTING SUBJECTS                         ││
│  │  ┌──────────────────────────────────────────┐ ││
│  │  │ CODE   │ NAME                  │ EDIT │   │ ││
│  │  ├────────┼───────────────────────┼──────┤   │ ││
│  │  │ CS301  │ Operating Systems    │ ✎ ✗  │   │ ││
│  │  │ CS302  │ Database Systems     │ ✎ ✗  │   │ ││
│  │  │ CS303  │ Web Development      │ ✎ ✗  │   │ ││
│  │  └──────────────────────────────────────────┘ ││
│  │                                                ││
│  │  ↓ [Click Edit]                               ││
│  │                                                ││
│  │  Step 3: SUBJECT FORM (Create/Edit)           ││
│  │  ┌──────────────────────────────────────────┐ ││
│  │  │ Code:              [CS304         ]      │ ││
│  │  │ Name:              [AI & ML       ]      │ ││
│  │  │ Credits:           [4           ]        │ ││
│  │  │ Faculty:           [Dr. Smith    ]       │ ││
│  │  │                                          │ ││
│  │  │ Assign to Classes:                       │ ││
│  │  │ ☑ Class A      ☐ Class B               │ ││
│  │  │                                          │ ││
│  │  │ Time Periods/Slots: (Optional)          │ ││
│  │  │ ☑ Period 1 (09:00-09:50)               │ ││
│  │  │ ☑ Period 3 (10:50-11:40)               │ ││
│  │  │                                          │ ││
│  │  │ [Save]  [Cancel]                        │ ││
│  │  └──────────────────────────────────────────┘ ││
│  │                                                ││
│  │  [Back]                                      ││
│  └────────────────────────────────────────────────┘│
│                                                    │
│  ✓ All data saved to localStorage                 │
│    Storage Key: "subjects_<semesterId>"           │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Requirements

### File Structure to Create

```
app/
  admin/
    subjects/
      page.tsx              # Main subjects management page
      [subjectId]/
        edit/
          page.tsx          # Edit subject page
    components/
      SubjectForm.tsx       # Reusable form component
      SubjectList.tsx       # Table of subjects
      SemesterSelector.tsx  # Context selector

utils/
  subjectStorage.ts         # CRUD operations for subjects

hooks/
  useSubjects.ts            # Custom hook for subject management
  useSemesters.ts           # Custom hook for semester management

data/
  subjectDefaults.ts        # Default subjects per semester
```

---

## 📝 Feature Specifications

### Admin Subject Manager Page (`/admin/subjects`)

**Functionality:**

1. **Semester Selection** (Step 1)
   - Select Batch (dropdown, required)
   - Select Department (dropdown, required)
   - Select/Create Semester (dropdown + new button)
2. **Subject List** (Step 2)
   - Display all subjects for selected semester
   - Columns: Code, Name, Credits, Faculty, Classes, Actions
   - Actions: Edit pencil icon, Delete X icon
   - "Add New Subject +" button at top
3. **Subject Form** (Step 3 - Modal/Page)
   - **Fields:**
     - Subject Code (text, unique, required) - e.g., "CS301"
     - Subject Name (text, required) - e.g., "Operating Systems"
     - Credits (number, 1-4, required)
     - Faculty Name (text, optional)
     - Multi-select Classes (checkboxes - Class A, Class B, etc.)
     - Multi-select Periods (checkboxes - Period 1-7)
   - **Validation:**
     - Code must be unique per semester
     - Name must be non-empty
     - At least one class must be assigned
     - Credits must be 1-4
   - **Actions:**
     - Submit → Save to storage
     - Cancel → Go back to list
     - Delete → Remove subject (with confirmation)

### Storage Strategy

```typescript
// localStorage Keys
"semesters_<batchId>_<departmentId>"; // Array of semesters
"subjects_<semesterId>"; // Array of subjects
"classMappings_<semesterId>"; // Subject-to-class mappings
```

---

## 🔗 Integration Points with Existing System

### Attendance Feature Integration

When staff marks attendance, they should be able to:

- Select from **subjects created in admin section** (not hardcoded)
- System validates subject belongs to selected batch/dept/semester
- Time periods defined in subject inform period availability

### Existing Data to Reuse

- Batch data → `data/mockDatabase.ts`
- Department data → `data/mockDatabase.ts`
- Class data → `data/mockDatabase.ts`
- Period configs → `data/periodConfigs.ts`
- Time utilities → `utils/periodDetection.ts`

---

## 🔐 Access Control

**Route Protection:**

- Only users with `role: "admin"` can access `/admin/subjects`
- Check admin authentication status
- Redirect to `/admin/login` if not authenticated

---

## 🎨 Styling & Components

**Use Existing Components:**

- `Button.tsx` - for all actions
- `Card.tsx` - for form containers
- `Input.tsx` - for text fields
- `Select.tsx` - for dropdowns
- `Checkbox.tsx` - for multi-select
- `DataTable.tsx` - for subject list table

**Theme:**

- Follow existing theme in `styles/theme.ts`
- Use TailwindCSS for responsive design
- Ensure mobile-friendly layout

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│           ADMIN SUBJECT MANAGEMENT FLOW                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Admin User                                              │
│      │                                                   │
│      └──→ /admin/subjects (authenticate)               │
│             ├─→ Load Batches (from mockDB)             │
│             ├─→ Load Departments (from mockDB)         │
│             ├─→ Load Semesters (from localStorage)     │
│             │                                           │
│             └──→ Select Semester                       │
│                    ├─→ Load Subjects (localStorage)    │
│                    ├─→ Load Class Mappings             │
│                    │                                   │
│                    └──→ [Add New / Edit / Delete]     │
│                           │                             │
│                           └──→ New Form/Modal          │
│                                  │                      │
│                                  ├─→ Validate Input    │
│                                  ├─→ Save to Storage   │
│                                  └─→ Update UI         │
│                                                          │
│  Storage: localStorage (Session-persistent)            │
│  ├─ semesters_<batchId>_<departmentId>               │
│  ├─ subjects_<semesterId>                            │
│  └─ classMappings_<semesterId>                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

1. ✓ Admin can select batch, department, and semester
2. ✓ Admin can view all subjects for selected semester
3. ✓ Admin can create new subject with code, name, credits, faculty
4. ✓ Admin can assign subjects to multiple classes
5. ✓ Admin can assign subjects to time periods
6. ✓ Admin can edit existing subjects
7. ✓ Admin can delete subjects (with confirmation)
8. ✓ All data persists in localStorage
9. ✓ Form validation prevents invalid entries
10. ✓ UI is responsive and mobile-friendly
11. ✓ Unique subject code per semester is enforced
12. ✓ Integration with existing attendance system

---

## 🚀 Implementation Steps (Recommended Order)

1. **Create Types** → Update `types/index.ts`
2. **Create Storage** → Build `utils/subjectStorage.ts`
3. **Create Hooks** → Build `hooks/useSubjects.ts` & `useSemesters.ts`
4. **Create Components** → Build form, list, selector components
5. **Create Pages** → Build `/admin/subjects` main page
6. **Add Sidebar Link** → Add to admin navigation
7. **Test with Attendance** → Verify integration with attendance feature
8. **Documentation** → Update README with new feature

---

## 📚 Related Documentation

- `PROJECT_OVERVIEW.md` - Main architecture
- `ATTENDANCE_SYSTEM.md` - Current attendance implementation
- `IMPLEMENTATION_SUMMARY.md` - What's been built so far
