const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");

/**
 * @route   GET /api/students
 * @desc    Get all students with query filtering, sorting, and pagination
 * @access  Public
 */
router.get("/", apiController.getAllStudents);

/**
 * @route   GET /api/students/stats
 * @desc    Get aggregated placement statistics & department breakdown
 * @access  Public
 */
router.get("/stats", apiController.getPlacementStats);

/**
 * @route   POST /api/students/reset
 * @desc    Reset mock data to initial state (for testing)
 * @access  Public
 */
router.post("/reset", apiController.resetStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Get a single student by dynamic ID parameter
 * @access  Public
 */
router.get("/:id", apiController.getStudentById);

/**
 * @route   POST /api/students
 * @desc    Create a new student placement record
 * @access  Public
 */
router.post("/", apiController.createStudent);

/**
 * @route   PUT /api/students/:id
 * @desc    Update an existing student record by ID
 * @access  Public
 */
router.put("/:id", apiController.updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student record by ID
 * @access  Public
 */
router.delete("/:id", apiController.deleteStudent);

module.exports = router;
