import express from "express";
import cors from "cors";
import attendanceRoutes from "./routes/attendance.routes";
import studentRoutes from "./routes/students.routes";
import dataRoutes from "./routes/data.routes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/data", dataRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "✅ Backend running on port 5000" });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "College Attendance Portal - Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      dataInit: "POST /api/data/init",
      dataStructure: "GET /api/data/structure",
      studentsGet: "GET /api/students?year=&department=&class=&section=",
      studentsAll: "GET /api/students/all",
      attendanceSubmit: "POST /api/attendance/submit",
      attendanceAll: "GET /api/attendance/all",
      attendanceBySection: "GET /api/attendance/by-section",
    },
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📊 Total mock students generated: 960 (20 per section)`);
  console.log(`   Years: 3 | Departments: 4 | Classes: 3 | Sections: 2`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
