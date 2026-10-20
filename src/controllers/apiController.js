const { getStudents, setStudents, getNextId, resetData } = require("../data/mockData");
const { ApiError } = require("../middleware/errorHandler");

/**
 * Helper: Validate Email Format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * GET /api/students
 * Retrieve all students with filtering, sorting, and pagination
 */
const getAllStudents = (req, res, next) => {
  try {
    let list = [...getStudents()];

    // 1. Query Filtering
    const { department, status, company, minCgpa, maxCgpa, search, sortBy, order, page, limit } = req.query;

    // Filter by department (case-insensitive)
    if (department) {
      list = list.filter(
        (s) => s.department && s.department.toLowerCase() === department.trim().toLowerCase()
      );
    }

    // Filter by placement status (case-insensitive)
    if (status) {
      list = list.filter(
        (s) => s.placementStatus && s.placementStatus.toLowerCase() === status.trim().toLowerCase()
      );
    }

    // Filter by company name (partial, case-insensitive)
    if (company) {
      list = list.filter(
        (s) => s.company && s.company.toLowerCase().includes(company.trim().toLowerCase())
      );
    }

    // Filter by minimum CGPA
    if (minCgpa !== undefined) {
      const min = parseFloat(minCgpa);
      if (isNaN(min)) {
        throw ApiError.badRequest("Query parameter 'minCgpa' must be a valid number");
      }
      list = list.filter((s) => s.cgpa >= min);
    }

    // Filter by maximum CGPA
    if (maxCgpa !== undefined) {
      const max = parseFloat(maxCgpa);
      if (isNaN(max)) {
        throw ApiError.badRequest("Query parameter 'maxCgpa' must be a valid number");
      }
      list = list.filter((s) => s.cgpa <= max);
    }

    // Text search across name, rollNumber, and skills
    if (search) {
      const searchLower = search.trim().toLowerCase();
      list = list.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(searchLower);
        const rollMatch = s.rollNumber.toLowerCase().includes(searchLower);
        const skillsMatch = Array.isArray(s.skills) && s.skills.some((skill) => skill.toLowerCase().includes(searchLower));
        return nameMatch || rollMatch || skillsMatch;
      });
    }

    // 2. Sorting
    const sortField = sortBy || "id";
    const sortOrder = order && order.toLowerCase() === "desc" ? -1 : 1;

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === "string") {
        return valA.localeCompare(valB) * sortOrder;
      }
      return (valA - valB) * sortOrder;
    });

    // 3. Pagination Logic
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    if (pageNum < 1) {
      throw ApiError.badRequest("Page parameter must be a positive integer >= 1");
    }
    if (limitNum < 1 || limitNum > 100) {
      throw ApiError.badRequest("Limit parameter must be between 1 and 100");
    }

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedResults = list.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      message: "Student records retrieved successfully",
      count: paginatedResults.length,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      data: paginatedResults
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id
 * Retrieve a single student by dynamic ID parameter
 */
const getStudentById = (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId) || studentId <= 0) {
      throw ApiError.badRequest("Invalid ID parameter. Student ID must be a positive integer.");
    }

    const students = getStudents();
    const student = students.find((s) => s.id === studentId);

    if (!student) {
      throw ApiError.notFound(`Student with ID ${studentId} does not exist`);
    }

    res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      data: student
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students
 * Create a new student record
 */
const createStudent = (req, res, next) => {
  try {
    const {
      name,
      rollNumber,
      email,
      department,
      cgpa,
      skills,
      placementStatus,
      company,
      packageOffered
    } = req.body;

    const validationErrors = [];

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      validationErrors.push("Field 'name' is required and must be a non-empty string");
    }

    if (!rollNumber || typeof rollNumber !== "string" || rollNumber.trim().length === 0) {
      validationErrors.push("Field 'rollNumber' is required");
    }

    if (!email || !isValidEmail(email)) {
      validationErrors.push("Field 'email' is required and must be a valid email address");
    }

    if (!department || typeof department !== "string" || department.trim().length === 0) {
      validationErrors.push("Field 'department' is required");
    }

    if (cgpa === undefined || typeof cgpa !== "number" || cgpa < 0 || cgpa > 10) {
      validationErrors.push("Field 'cgpa' is required and must be a number between 0.0 and 10.0");
    }

    const validStatuses = ["Placed", "Unplaced", "Interviewing"];
    const status = placementStatus || "Unplaced";
    if (!validStatuses.includes(status)) {
      validationErrors.push(`Field 'placementStatus' must be one of: ${validStatuses.join(", ")}`);
    }

    if (validationErrors.length > 0) {
      throw ApiError.badRequest("Validation failed for creating student", validationErrors);
    }

    const students = getStudents();

    // Check unique constraints: rollNumber & email
    const existingRoll = students.find(
      (s) => s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase()
    );
    if (existingRoll) {
      throw ApiError.conflict(`Student with roll number '${rollNumber.trim()}' already exists`);
    }

    const existingEmail = students.find(
      (s) => s.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existingEmail) {
      throw ApiError.conflict(`Student with email '${email.trim()}' already exists`);
    }

    const newStudent = {
      id: getNextId(),
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      cgpa: Number(cgpa.toFixed(2)),
      skills: Array.isArray(skills) ? skills.map((sk) => String(sk).trim()).filter(Boolean) : [],
      placementStatus: status,
      company: status === "Placed" ? (company ? company.trim() : null) : (status === "Interviewing" ? (company ? company.trim() : null) : null),
      packageOffered: status === "Placed" && packageOffered ? Number(packageOffered) : null,
      placedDate: status === "Placed" ? new Date().toISOString().split("T")[0] : null,
      createdAt: new Date().toISOString()
    };

    students.push(newStudent);
    setStudents(students);

    res.status(201).json({
      success: true,
      message: "Student record created successfully",
      data: newStudent
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/:id
 * Fully/partially update an existing student record
 */
const updateStudent = (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId) || studentId <= 0) {
      throw ApiError.badRequest("Invalid student ID parameter. Must be a positive integer.");
    }

    const students = getStudents();
    const index = students.findIndex((s) => s.id === studentId);

    if (index === -1) {
      throw ApiError.notFound(`Student with ID ${studentId} not found`);
    }

    const existingStudent = students[index];
    const {
      name,
      rollNumber,
      email,
      department,
      cgpa,
      skills,
      placementStatus,
      company,
      packageOffered
    } = req.body;

    const validationErrors = [];

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      validationErrors.push("Field 'name' cannot be empty");
    }

    if (email !== undefined && !isValidEmail(email)) {
      validationErrors.push("Field 'email' must be a valid email address");
    }

    if (cgpa !== undefined && (typeof cgpa !== "number" || cgpa < 0 || cgpa > 10)) {
      validationErrors.push("Field 'cgpa' must be a number between 0.0 and 10.0");
    }

    const validStatuses = ["Placed", "Unplaced", "Interviewing"];
    if (placementStatus !== undefined && !validStatuses.includes(placementStatus)) {
      validationErrors.push(`Field 'placementStatus' must be one of: ${validStatuses.join(", ")}`);
    }

    if (validationErrors.length > 0) {
      throw ApiError.badRequest("Validation failed for updating student", validationErrors);
    }

    // Check duplicate rollNumber
    if (rollNumber && rollNumber.trim().toUpperCase() !== existingStudent.rollNumber) {
      const duplicateRoll = students.find(
        (s) => s.id !== studentId && s.rollNumber.toUpperCase() === rollNumber.trim().toUpperCase()
      );
      if (duplicateRoll) {
        throw ApiError.conflict(`Another student with roll number '${rollNumber.trim()}' already exists`);
      }
    }

    // Check duplicate email
    if (email && email.trim().toLowerCase() !== existingStudent.email.toLowerCase()) {
      const duplicateEmail = students.find(
        (s) => s.id !== studentId && s.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (duplicateEmail) {
        throw ApiError.conflict(`Another student with email '${email.trim()}' already exists`);
      }
    }

    const newStatus = placementStatus !== undefined ? placementStatus : existingStudent.placementStatus;

    const updatedStudent = {
      ...existingStudent,
      name: name !== undefined ? name.trim() : existingStudent.name,
      rollNumber: rollNumber !== undefined ? rollNumber.trim().toUpperCase() : existingStudent.rollNumber,
      email: email !== undefined ? email.trim().toLowerCase() : existingStudent.email,
      department: department !== undefined ? department.trim() : existingStudent.department,
      cgpa: cgpa !== undefined ? Number(cgpa.toFixed(2)) : existingStudent.cgpa,
      skills: skills !== undefined ? (Array.isArray(skills) ? skills.map((sk) => String(sk).trim()).filter(Boolean) : []) : existingStudent.skills,
      placementStatus: newStatus,
      company: newStatus === "Unplaced" ? null : (company !== undefined ? company : existingStudent.company),
      packageOffered: newStatus === "Placed" ? (packageOffered !== undefined ? Number(packageOffered) : existingStudent.packageOffered) : null,
      placedDate: newStatus === "Placed" ? (existingStudent.placedDate || new Date().toISOString().split("T")[0]) : null,
      updatedAt: new Date().toISOString()
    };

    students[index] = updatedStudent;
    setStudents(students);

    res.status(200).json({
      success: true,
      message: "Student record updated successfully",
      data: updatedStudent
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/students/:id
 * Delete a student record by ID
 */
const deleteStudent = (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId) || studentId <= 0) {
      throw ApiError.badRequest("Invalid student ID parameter. Must be a positive integer.");
    }

    const students = getStudents();
    const index = students.findIndex((s) => s.id === studentId);

    if (index === -1) {
      throw ApiError.notFound(`Student with ID ${studentId} not found`);
    }

    const [deletedStudent] = students.splice(index, 1);
    setStudents(students);

    res.status(200).json({
      success: true,
      message: `Student with ID ${studentId} (${deletedStudent.name}) deleted successfully`,
      data: {
        deletedId: studentId,
        rollNumber: deletedStudent.rollNumber
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/stats
 * Aggregated placement metrics & department breakdowns
 */
const getPlacementStats = (req, res, next) => {
  try {
    const students = getStudents();
    const total = students.length;

    const placed = students.filter((s) => s.placementStatus === "Placed");
    const interviewing = students.filter((s) => s.placementStatus === "Interviewing");
    const unplaced = students.filter((s) => s.placementStatus === "Unplaced");

    const placementRate = total > 0 ? Number(((placed.length / total) * 100).toFixed(2)) : 0;

    const packages = placed.map((s) => s.packageOffered).filter((p) => typeof p === "number" && p > 0);
    const avgPackage = packages.length > 0 ? Math.round(packages.reduce((a, b) => a + b, 0) / packages.length) : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    const avgCgpa = total > 0 ? Number((students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / total).toFixed(2)) : 0;

    // Department breakdown
    const departmentStats = {};
    students.forEach((s) => {
      if (!departmentStats[s.department]) {
        departmentStats[s.department] = { total: 0, placed: 0 };
      }
      departmentStats[s.department].total += 1;
      if (s.placementStatus === "Placed") {
        departmentStats[s.department].placed += 1;
      }
    });

    res.status(200).json({
      success: true,
      message: "Placement statistics computed successfully",
      data: {
        totalStudents: total,
        placedCount: placed.length,
        interviewingCount: interviewing.length,
        unplacedCount: unplaced.length,
        placementRatePercentage: placementRate,
        averageCgpa: avgCgpa,
        packageStats: {
          currency: "INR",
          averagePackage: avgPackage,
          highestPackage: highestPackage
        },
        departmentBreakdown: departmentStats
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students/reset
 * Helper endpoint to reset mock database to initial seed data
 */
const resetStudents = (req, res, next) => {
  try {
    const resetList = resetData();
    res.status(200).json({
      success: true,
      message: "Database successfully reset to initial seed data",
      count: resetList.length
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getPlacementStats,
  resetStudents
};
