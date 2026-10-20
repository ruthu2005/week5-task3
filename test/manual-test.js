/**
 * Automated Verification Script for Student Placement Tracker REST API
 * Tests all REST endpoints, dynamic routing, query filtering, pagination, and error handlers.
 */

const http = require("http");
const app = require("../src/app");

const TEST_PORT = 3005;
let server;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers,
      ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {})
    };

    const req = http.request(
      {
        hostname: "localhost",
        port: TEST_PORT,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log("===============================================================");
  console.log("🧪 STARTING REST API COMPREHENSIVE TEST SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? `-> ${details}` : ""}`);
      failed++;
    }
  }

  try {
    // 1. Health Endpoint
    console.log("1. Server Health Check:");
    const health = await request("GET", "/health");
    assert("GET /health returns 200 OK", health.status === 200);
    assert("Health status is 'UP'", health.body.status === "UP");

    // 2. Base API Info
    console.log("\n2. Base API Metadata:");
    const apiBase = await request("GET", "/api");
    assert("GET /api returns 200 OK", apiBase.status === 200);
    assert("Lists endpoints", !!apiBase.body.endpoints);

    // 3. GET /api/students (Default Pagination)
    console.log("\n3. GET /api/students (Pagination & Retrieval):");
    const getRes = await request("GET", "/api/students");
    assert("Returns 200 OK", getRes.status === 200);
    assert("Response has success flag", getRes.body.success === true);
    assert("Returns pagination object", !!getRes.body.pagination);
    assert("Default page is 1", getRes.body.pagination.currentPage === 1);
    assert("Default limit is 10", getRes.body.pagination.limit === 10);
    assert("Data array is present", Array.isArray(getRes.body.data));

    // 4. Custom Pagination (Page 2, Limit 4)
    console.log("\n4. Pagination Parameters (?page=2&limit=4):");
    const pageRes = await request("GET", "/api/students?page=2&limit=4");
    assert("Returns 200 OK", pageRes.status === 200);
    assert("Current page is 2", pageRes.body.pagination.currentPage === 2);
    assert("Limit is 4", pageRes.body.pagination.limit === 4);
    assert("Count of data matches limit", pageRes.body.data.length === 4);

    // 5. Query Filtering (Department)
    console.log("\n5. Query Filtering by Department (?department=Computer Science):");
    const deptRes = await request("GET", "/api/students?department=Computer%20Science");
    assert("Returns 200 OK", deptRes.status === 200);
    const allCs = deptRes.body.data.every((s) => s.department === "Computer Science");
    assert("All returned items belong to Computer Science", allCs);

    // 6. Query Filtering (Status & minCgpa)
    console.log("\n6. Query Filtering by Status & Min CGPA (?status=Placed&minCgpa=8.5):");
    const filterRes = await request("GET", "/api/students?status=Placed&minCgpa=8.5");
    assert("Returns 200 OK", filterRes.status === 200);
    const allPlacedAndHighCgpa = filterRes.body.data.every((s) => s.placementStatus === "Placed" && s.cgpa >= 8.5);
    assert("All records are Placed with CGPA >= 8.5", allPlacedAndHighCgpa);

    // 7. Search Query (?search=React)
    console.log("\n7. Text Search Filter (?search=React):");
    const searchRes = await request("GET", "/api/students?search=React");
    assert("Returns 200 OK", searchRes.status === 200);
    assert("Found matching students with skill/text React", searchRes.body.data.length > 0);

    // 8. Sorting (?sortBy=cgpa&order=desc)
    console.log("\n8. Sorting (?sortBy=cgpa&order=desc):");
    const sortRes = await request("GET", "/api/students?sortBy=cgpa&order=desc&limit=5");
    assert("Returns 200 OK", sortRes.status === 200);
    const firstCgpa = sortRes.body.data[0].cgpa;
    const secondCgpa = sortRes.body.data[1].cgpa;
    assert("Sorted in descending order of CGPA", firstCgpa >= secondCgpa);

    // 9. GET /api/students/:id (Dynamic Route Parameter)
    console.log("\n9. Dynamic Route Parameter (GET /api/students/:id):");
    const student1 = await request("GET", "/api/students/1");
    assert("Returns 200 OK for valid ID 1", student1.status === 200);
    assert("Student ID matches requested ID", student1.body.data.id === 1);
    assert("Student name matches seed", student1.body.data.name === "Aarav Sharma");

    // 10. GET /api/students/:id with Non-Existent ID (404 Error Handling)
    console.log("\n10. Error Handling - 404 for Non-Existent Resource:");
    const notFoundRes = await request("GET", "/api/students/9999");
    assert("Returns 404 Not Found", notFoundRes.status === 404);
    assert("Response has success: false", notFoundRes.body.success === false);
    assert("Error object contains 404 code", notFoundRes.body.error.statusCode === 404);

    // 11. Invalid Parameter Format (400 Bad Request)
    console.log("\n11. Error Handling - 400 for Invalid ID format:");
    const invalidIdRes = await request("GET", "/api/students/invalid-id");
    assert("Returns 400 Bad Request", invalidIdRes.status === 400);
    assert("Error message explains invalid ID format", invalidIdRes.body.error.message.includes("Invalid ID"));

    // 12. POST /api/students (Create New Student)
    console.log("\n12. POST /api/students (Create New Student):");
    const newStudentData = {
      name: "Divya Gupta",
      rollNumber: "CS2021199",
      email: "divya.gupta@college.edu",
      department: "Computer Science",
      cgpa: 9.15,
      skills: ["Go", "Kubernetes", "PostgreSQL"],
      placementStatus: "Placed",
      company: "Atlassian",
      packageOffered: 2600000
    };
    const createRes = await request("POST", "/api/students", newStudentData);
    assert("Returns 201 Created", createRes.status === 201);
    assert("Created student has assigned ID", typeof createRes.body.data.id === "number");
    assert("Created student preserves rollNumber", createRes.body.data.rollNumber === "CS2021199");
    const createdId = createRes.body.data.id;

    // 13. POST Validation Error (Missing required fields)
    console.log("\n13. Error Handling - 400 on Missing Fields (Validation):");
    const badCreateRes = await request("POST", "/api/students", { name: "Incomplete" });
    assert("Returns 400 Bad Request", badCreateRes.status === 400);
    assert("Error details contains missing fields info", Array.isArray(badCreateRes.body.error.details));

    // 14. POST Conflict Error (Duplicate Roll Number)
    console.log("\n14. Error Handling - 409 Conflict (Duplicate Unique Key):");
    const duplicateRes = await request("POST", "/api/students", newStudentData);
    assert("Returns 409 Conflict", duplicateRes.status === 409);
    assert("Error message mentions duplicate roll number", duplicateRes.body.error.message.includes("already exists"));

    // 15. PUT /api/students/:id (Update Record)
    console.log("\n15. PUT /api/students/:id (Update Student):");
    const updateRes = await request("PUT", `/api/students/${createdId}`, {
      company: "Atlassian Australia",
      packageOffered: 3100000,
      skills: ["Go", "Kubernetes", "AWS", "Terraform"]
    });
    assert("Returns 200 OK", updateRes.status === 200);
    assert("Updated company verified", updateRes.body.data.company === "Atlassian Australia");
    assert("Updated package verified", updateRes.body.data.packageOffered === 3100000);

    // 16. DELETE /api/students/:id (Delete Record)
    console.log("\n16. DELETE /api/students/:id (Delete Student):");
    const deleteRes = await request("DELETE", `/api/students/${createdId}`);
    assert("Returns 200 OK", deleteRes.status === 200);
    assert("Success message confirms deletion", deleteRes.body.message.includes("deleted successfully"));

    // Confirm it's gone
    const verifyDelete = await request("GET", `/api/students/${createdId}`);
    assert("Confirming deleted record now returns 404", verifyDelete.status === 404);

    // 17. GET /api/students/stats (Analytics Endpoint)
    console.log("\n17. GET /api/students/stats (Aggregated Statistics):");
    const statsRes = await request("GET", "/api/students/stats");
    assert("Returns 200 OK", statsRes.status === 200);
    assert("Includes totalStudents metric", typeof statsRes.body.data.totalStudents === "number");
    assert("Includes placementRatePercentage", typeof statsRes.body.data.placementRatePercentage === "number");
    assert("Includes departmentBreakdown", typeof statsRes.body.data.departmentBreakdown === "object");

    // 18. Undefined Route Handler (Global 404 Interceptor)
    console.log("\n18. Undefined Route Handler:");
    const undefinedRes = await request("GET", "/api/nonexistent/endpoint");
    assert("Returns 404 for undefined route", undefinedRes.status === 404);
    assert("Error message mentions Endpoint not found", undefinedRes.body.error.message.includes("Endpoint not found"));

    console.log("\n===============================================================");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("===============================================================\n");

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  }
}

server = app.listen(TEST_PORT, () => {
  runTests();
});
