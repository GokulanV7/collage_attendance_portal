# Attendance Portal

A modern, mobile-first attendance management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multi-step Attendance Flow**: Batch → Department → Class → Attendance Sheet
- **Real-time Attendance Tracking**: Mark students as Present/Absent with instant feedback
- **Staff Identification**: Capture staff details before submission
- **Comprehensive Confirmation**: View detailed submission summary with absent students list
- **Mobile Responsive**: Touch-friendly UI optimized for tablets and mobile devices
- **Data-Driven Classes**: Classes dynamically loaded based on department selection
- **Validation**: Form validation with helpful error messages
- **Mock Data**: Self-contained system with realistic mock student data

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
attendance-portal/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main attendance page (multi-step form)
│   └── globals.css         # Global styles with Tailwind
├── components/
│   ├── Button.tsx          # Reusable button component
│   ├── Card.tsx            # Card container component
│   ├── Input.tsx           # Text input component
│   ├── Select.tsx          # Dropdown select component
│   └── StudentRow.tsx      # Student attendance row
├── data/
│   └── mockDatabase.ts     # Mock data (batches, departments, classes, students)
├── types/
│   └── index.ts            # TypeScript type definitions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## Usage Flow

1. **Select Batch**: Choose from available batches (e.g., 2021–2025, 2022–2026, 2023–2027)
2. **Select Department**: Choose department (CSE, IT, ECE, ME)
3. **Select Class**: Choose class (A, B, C) - dynamically loaded based on department
4. **Mark Attendance**: 
   - All students default to "Present"
   - Toggle individual student status
   - Use "Mark All Present" or "Mark All Absent" for bulk operations
   - View real-time Present/Absent counts
5. **Enter Staff Details**: Provide Staff ID and Staff Name
6. **Submit**: View comprehensive confirmation with submission details and absent students list

## Mock Data Structure

The application includes mock data for:

- **3 Batches**: 2021–2025, 2022–2026, 2023–2027
- **4 Departments**: 
  - Computer Science Engineering (3 classes: A, B, C)
  - Information Technology (2 classes: A, B)
  - Electronics and Communication Engineering (2 classes: A, B)
  - Mechanical Engineering (2 classes: A, B)
- **70+ Students**: Realistic names and roll numbers across all departments

## Key Features

### Validation
- Required field validation for Batch, Department, Class
- Staff ID and Staff Name validation before submission
- Helpful error messages displayed inline

### Mobile Responsiveness
- Touch-friendly buttons and toggles
- Optimized spacing for mobile devices
- Sticky submit button on mobile
- Responsive grid layouts

### State Management
- Efficient state management with React Hooks
- Map-based attendance tracking for O(1) lookups
- Proper state cleanup on reset

### User Experience
- Smooth transitions between steps
- Clear visual feedback (green for present, red for absent)
- Summary statistics (Total, Present, Absent counts)
- Detailed confirmation screen with all submission data

## Customization

### Adding More Data

Edit `data/mockDatabase.ts` to add:
- New batches
- New departments
- New classes
- More students

### Styling

- Colors: Modify `tailwind.config.ts` for custom color schemes
- Components: Edit individual component files in `components/`
- Global styles: Update `app/globals.css`

## Production Build

```bash
npm run build
npm run start
```

## Notes

- This is a self-contained demo application with mock data
- No backend or database required
- Attendance data is logged to console (not persisted)
- To add real backend integration, modify the `handleSubmit` function in `app/page.tsx`

## Future Enhancements

- Backend API integration
- Database persistence
- Authentication and authorization
- Historical attendance reports
- Export functionality (PDF, Excel)
- Multi-language support
- Offline mode with sync

## License

This project is open source and available under the MIT License.
