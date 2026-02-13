# Attendance Management Portal

A comprehensive, mobile-first attendance management system with **separate Staff and Admin interfaces**, built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

### 🧑‍🏫 Staff Portal
- **Staff Validation**: Secure authentication with Staff ID
- **Multi-step Flow**: Guided 6-step process with progress indicator
- **Time-based Period Selection**: Automatic detection of current teaching period
- **Multiple Period Support**: Mark attendance for multiple periods at once
- **Three Attendance States**: Present, Absent, On-Duty
- **Real-time Statistics**: Live counts during attendance marking
- **Comprehensive Confirmation**: Detailed submission summary

### 👨‍💼 Admin Portal
- **Secure Access**: Admin code authentication
- **Excel-style Table**: Professional spreadsheet-like data view
- **Advanced Filtering**: Filter by Date, Period, Class, Staff ID
- **Horizontal Scroll**: Mobile-optimized table with full data visibility
- **Sticky Headers**: Table headers stay visible while scrolling
- **Real-time Statistics**: Dashboard with submission counts
- **Empty State Handling**: Helpful guidance when no data exists

### 🎯 Core Features
- **Mobile-First Design**: Touch-friendly UI optimized for tablets and phones
- **Progress Indicators**: Visual step-by-step guidance
- **Form Validation**: Inline error messages and required field checks
- **Mock Database**: Self-contained with 70+ students, 10 staff, 8 periods
- **Global State Management**: React Context for attendance storage
- **Period Detection**: Automatic current period identification based on time
- **Responsive Tables**: Adapts perfectly to all screen sizes

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context API
- **Data**: In-memory mock database
- **Routing**: Next.js file-based routing

## 📁 Project Structure

```
Collage_attendance_Portal/
├── app/
│   ├── layout.tsx                    # Root layout with AttendanceProvider
│   ├── page.tsx                      # Home page (Role selection)
│   ├── staff/
│   │   ├── validate/page.tsx         # Screen 1: Staff validation
│   │   ├── batch/page.tsx            # Screen 2: Batch selection
│   │   ├── department/page.tsx       # Screen 3: Department selection
│   │   ├── class-period/page.tsx     # Screen 4: Class & period selection
│   │   ├── mark-attendance/page.tsx  # Screen 5: Mark attendance
│   │   └── confirmation/page.tsx     # Screen 6: Confirmation
│   └── admin/
│       ├── login/page.tsx            # Admin authentication
│       └── view/page.tsx             # Excel-style data table
├── components/
│   ├── Button.tsx                    # Reusable button
│   ├── Card.tsx                      # Card container
│   ├── Checkbox.tsx                  # Checkbox for periods
│   ├── Input.tsx                     # Text input
│   ├── PageLayout.tsx                # Consistent page layout
│   ├── ProgressIndicator.tsx         # Multi-step progress bar
│   ├── RadioGroup.tsx                # Attendance status selector
│   ├── Select.tsx                    # Dropdown select
│   ├── StudentRow.tsx                # (Legacy - not used)
│   └── DataTable.tsx                 # Excel-style table with filters
├── context/
│   └── AttendanceContext.tsx         # Global attendance state
├── data/
│   ├── mockDatabase.ts               # Students, departments, classes
│   └── mockStaffAndPeriods.ts        # Staff and period data
├── types/
│   └── index.ts                      # TypeScript definitions
├── utils/
│   └── periodDetection.ts            # Time-based period logic
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Install dependencies**:
```bash
npm install
# or
yarn install
```

2. **Run development server**:
```bash
npm run dev
```

3. **Open browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage Guide

### Staff Workflow

1. **Home** → Select "Staff Portal"

2. **Staff Validation** (Screen 1)
   - Enter Staff ID (e.g., STAFF001, STAFF002, STAFF003)
   - Sample IDs displayed on screen

3. **Batch Selection** (Screen 2)
   - Choose academic batch (2021–2025, 2022–2026, 2023–2027)

4. **Department Selection** (Screen 3)
   - Select department (CSE, IT, ECE, ME)

5. **Class & Period Selection** (Screen 4)
   - Select class (A, B, C - varies by department)
   - **Automatic period detection** based on current time
   - Select multiple periods using checkboxes
   - Current time displayed for reference

6. **Mark Attendance** (Screen 5)
   - All students default to "Present"
   - Toggle individual: Present / Absent / On-Duty
   - Bulk actions: "Mark All Present" or "Mark All Absent"
   - Real-time statistics (Total, Present, Absent, On-Duty)

7. **Confirmation** (Screen 6)
   - View complete submission details
   - See absent students list (if any)
   - Summary statistics
   - Options to mark new attendance or return home

### Admin Workflow

1. **Home** → Select "Admin Portal"

2. **Admin Login**
   - Enter admin code: `ADMIN123` or `admin`

3. **View Attendance Records**
   - **Summary Dashboard**: Total submissions, records, present, absent, on-duty
   - **Excel-style Table**: All attendance data in spreadsheet format
   - **Filters**: Date, Period, Class, Staff ID
   - **Horizontal Scroll**: View all columns on mobile
   - **Empty State**: Helpful message if no data exists

## 🎨 Key Features Explained

### Time-Based Period Detection

The system automatically detects which period is currently active:

```typescript
Period 1: 09:00 - 09:50
Period 2: 09:50 - 10:40
Period 3: 10:50 - 11:40
Period 4: 11:40 - 12:30
Period 5: 13:30 - 14:20
Period 6: 14:20 - 15:10
Period 7: 15:20 - 16:10
Period 8: 16:10 - 17:00
```

- Current period is **auto-selected** by default
- Staff can **override** and select different/multiple periods
- Current time displayed for reference

### Three Attendance States

Unlike traditional Present/Absent, we support:
- **Present**: Student is in class
- **Absent**: Student is not in class
- **On-Duty**: Student is on official college duty (sports, events, etc.)

### Excel-Style Admin Table

Features:
- **10 columns**: Date, Batch, Dept, Class, Period, Staff ID, Staff Name, Roll No, Student Name, Status
- **Sticky headers**: Always visible while scrolling
- **Color-coded status**: Green (Present), Red (Absent), Blue (On-Duty)
- **4 filters**: Date, Period, Class, Staff ID
- **Record count**: Shows filtered results count
- **Mobile optimized**: Horizontal scroll with touch support

## 📊 Mock Data

### Staff (10 members)
```
STAFF001 - Dr. Rajesh Kumar (CSE)
STAFF002 - Prof. Priya Sharma (CSE)
STAFF003 - Dr. Arun Menon (IT)
STAFF004 - Prof. Lakshmi Iyer (IT)
STAFF005 - Dr. Suresh Reddy (ECE)
STAFF006 - Prof. Kavya Nair (ECE)
STAFF007 - Dr. Manoj Singh (ME)
STAFF008 - Prof. Deepa Rao (ME)
STAFF009 - Dr. Ganesh Murthy (CSE)
STAFF010 - Prof. Ananya Patel (IT)
```

### Departments & Classes
- **Computer Science Engineering**: 3 classes (A, B, C)
- **Information Technology**: 2 classes (A, B)
- **Electronics & Communication**: 2 classes (A, B)
- **Mechanical Engineering**: 2 classes (A, B)

### Students
- 70+ students across all departments
- Realistic Indian names and roll numbers

## 🔧 Customization

### Adding More Staff

Edit `data/mockStaffAndPeriods.ts`:
```typescript
export const staffData: Staff[] = [
  { id: "STAFF011", name: "Your Name", department: "CSE" },
  // ... more staff
];
```

### Modifying Period Timings

Edit `data/mockStaffAndPeriods.ts`:
```typescript
export const periods: Period[] = [
  { id: 1, name: "Period 1", startTime: "09:00", endTime: "09:50" },
  // ... modify as needed
];
```

### Adding More Students

Edit `data/mockDatabase.ts` and add students to appropriate arrays.

### Changing Admin Code

Edit `app/admin/login/page.tsx`:
```typescript
if (adminCode.trim() === "YOUR_CODE") {
  // ...
}
```

## 🎯 Production Build

```bash
npm run build
npm run start
```

## 📝 Notes

- **No Backend**: Everything runs in-browser with mock data
- **Session Storage**: User data stored temporarily (cleared on tab close)
- **Context API**: Attendance submissions stored in React Context
- **No Persistence**: Data cleared on page refresh (add backend for persistence)

## 🔮 Future Enhancements

- Backend API integration (Node.js/Express)
- Database persistence (MongoDB/PostgreSQL)
- Real authentication with JWT
- Historical reports and analytics
- PDF/Excel export functionality
- SMS/Email notifications for absent students
- Biometric integration
- Multi-language support
- Dark mode
- PWA support for offline mode

## 📄 License

MIT License - Open source and free to use

## 🤝 Contributing

This is a demo project. Feel free to fork and modify as needed!

---

**Demo Credentials**:
- **Staff**: STAFF001, STAFF002, STAFF003, etc.
- **Admin**: ADMIN123 or admin
