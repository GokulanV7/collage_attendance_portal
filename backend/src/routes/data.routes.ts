import express, { Request, Response } from "express";
import { MOCK_DATABASE } from "../data/dataGenerator";
import { ApiResponse } from "../types";

const router = express.Router();

// Initialize all mock data
router.post("/init", (_req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      message: "Mock data initialized",
      data: {
        studentsCount: MOCK_DATABASE.students.length,
        staffCount: MOCK_DATABASE.staff.length,
        adminsCount: MOCK_DATABASE.admins.length,
        students: MOCK_DATABASE.students,
        staff: MOCK_DATABASE.staff,
        admins: MOCK_DATABASE.admins,
      },
    } as ApiResponse<any>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error initializing data",
      error: error.message,
    });
  }
});

// Get Structure (Years, Departments, Classes, Sections)
router.get("/structure", (_req: Request, res: Response) => {
  try {
    const structure = {
      years: ["2021-2025", "2022-2026", "2023-2027"],
      departments: ["CSE", "IT", "ECE", "ME", "AIML"],
      classes: ["A", "B", "C"],
      sections: ["1", "2"],
      studentsPerSection: 20,
    };

    return res.json({
      success: true,
      message: "Data structure retrieved",
      data: structure,
    } as ApiResponse<any>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving structure",
      error: error.message,
    });
  }
});

export default router;
