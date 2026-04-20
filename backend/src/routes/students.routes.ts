import express, { Request, Response } from "express";
import { MOCK_DATABASE } from "../data/dataGenerator";
import { ApiResponse } from "../types";

const router = express.Router();

// Get Students by Section
router.get("/", (req: Request, res: Response) => {
  try {
    const { year, department, class: cls, section } = req.query;

    const students = MOCK_DATABASE.students.filter(
      (s) =>
        (!year || s.year === year) &&
        (!department || s.department === department) &&
        (!cls || s.class === cls) &&
        (!section || s.section === section),
    );

    return res.json({
      success: true,
      message: "Students retrieved",
      data: students,
    } as ApiResponse<any>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving students",
      error: error.message,
    });
  }
});

// Get All Students
router.get("/all", (_req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      message: "All students retrieved",
      data: MOCK_DATABASE.students,
    } as ApiResponse<any>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving students",
      error: error.message,
    });
  }
});

export default router;
