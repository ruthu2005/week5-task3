require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes/apiRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Core Middleware Configuration
// ============================================================================

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming requests with JSON payloads (Step 1 requirement)
app.use(express.json({ limit: "1mb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ============================================================================
// Documentation & Health Endpoints
// ============================================================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "Student Placement REST API"
  });
});

// Interactive HTML Landing & API Reference Dashboard
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Placement Tracker - RESTful API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(18, 24, 38, 0.85);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent: #10b981;
      --text: #f3f4f6;
      --text-muted: #94a3b8;
      --code-bg: #030712;
      --badge-get: #10b981;
      --badge-post: #6366f1;
      --badge-put: #f59e0b;
      --badge-delete: #ef4444;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: radial-gradient(circle at 10% 20%, #171b30 0%, var(--bg) 70%);
      color: var(--text);
      line-height: 1.6;
      padding: 2.5rem 1.5rem;
      min-height: 100vh;
    }

    .container {
      max-width: 1050px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 2.5rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1.5rem;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 9999px;
      color: #a5b4fc;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    p.subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
    }

    .grid-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
      backdrop-filter: blur(10px);
    }

    .stat-card .label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .stat-card .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .endpoint-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .endpoint-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.9rem 1.1rem;
      background: rgba(3, 7, 18, 0.4);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      transition: all 0.2s ease;
      text-decoration: none;
      color: inherit;
    }

    .endpoint-item:hover {
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-2px);
      background: rgba(15, 23, 42, 0.7);
    }

    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .badge-get { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-post { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .badge-put { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-delete { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

    .route-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      color: #f1f5f9;
    }

    .route-desc {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .interactive-section {
      margin-top: 1.5rem;
    }

    .btn-group {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    button.api-btn {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    button.api-btn:hover {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    #responseViewer {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      color: #38bdf8;
      max-height: 420px;
      overflow-y: auto;
      white-space: pre-wrap;
    }

    footer {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--card-border);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand-pill">⚡ Node.js + Express REST API</div>
      <h1>Student Placement Tracker API</h1>
      <p class="subtitle">Complete production-ready RESTful API implementation with dynamic routing, filtering, pagination, and centralized error handling.</p>
    </header>

    <div class="grid-stats">
      <div class="stat-card">
        <div class="label">API Status</div>
        <div class="value" style="color: #34d399;">Online 🟢</div>
      </div>
      <div class="stat-card">
        <div class="label">Base URL</div>
        <div class="value" style="font-size: 1.15rem; font-family: 'JetBrains Mono';">/api/students</div>
      </div>
      <div class="stat-card">
        <div class="label">Architecture</div>
        <div class="value" style="font-size: 1.15rem;">MVC Router-Controller</div>
      </div>
      <div class="stat-card">
        <div class="label">Error Handling</div>
        <div class="value" style="font-size: 1.15rem; color: #a5b4fc;">Centralized JSON</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📖 API Endpoints Reference</div>
      <div class="endpoint-list">
        <a href="/api/students" target="_blank" class="endpoint-item">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="route-path">/api/students</span>
          </div>
          <span class="route-desc">List all students with query filtering, sorting & pagination</span>
        </a>

        <a href="/api/students/stats" target="_blank" class="endpoint-item">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="route-path">/api/students/stats</span>
          </div>
          <span class="route-desc">Aggregated metrics, placement rate, average package</span>
        </a>

        <a href="/api/students/1" target="_blank" class="endpoint-item">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="route-path">/api/students/:id</span>
          </div>
          <span class="route-desc">Retrieve single student record by dynamic integer ID</span>
        </a>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="route-path">/api/students</span>
          </div>
          <span class="route-desc">Create a new student (validated JSON request body)</span>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="badge badge-put">PUT</span>
            <span class="route-path">/api/students/:id</span>
          </div>
          <span class="route-desc">Update existing student details by dynamic ID</span>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="badge badge-delete">DELETE</span>
            <span class="route-path">/api/students/:id</span>
          </div>
          <span class="route-desc">Delete student record by dynamic ID</span>
        </div>

        <a href="/health" target="_blank" class="endpoint-item">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="route-path">/health</span>
          </div>
          <span class="route-desc">API uptime and system health check</span>
        </a>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🧪 Quick Live Testing Sandbox</div>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
        Click any quick query below to send a live request to the Express server and view the formatted JSON response:
      </p>
      <div class="btn-group">
        <button class="api-btn" onclick="fetchLive('/api/students?page=1&limit=5')">GET Page 1 (Limit 5)</button>
        <button class="api-btn" onclick="fetchLive('/api/students?department=Computer%20Science')">Filter CS Dept</button>
        <button class="api-btn" onclick="fetchLive('/api/students?status=Placed&sortBy=packageOffered&order=desc')">Top Packages</button>
        <button class="api-btn" onclick="fetchLive('/api/students/stats')">Placement Stats</button>
        <button class="api-btn" onclick="fetchLive('/api/students/1')">GET Student #1</button>
        <button class="api-btn" onclick="fetchLive('/api/students/999')">Test 404 Not Found</button>
        <button class="api-btn" onclick="fetchLive('/api/students?page=-1')">Test 400 Bad Request</button>
      </div>
      <pre id="responseViewer">// Click one of the testing buttons above to inspect the live JSON response...</pre>
    </div>

    <footer>
      <p>Node.js & Express RESTful API • Student Placement Tracker • Week 5 Task 3</p>
    </footer>
  </div>

  <script>
    async function fetchLive(url) {
      const viewer = document.getElementById('responseViewer');
      viewer.textContent = 'Loading ' + url + ' ...';
      try {
        const res = await fetch(url);
        const data = await res.json();
        viewer.textContent = '// HTTP Status ' + res.status + ' ' + res.statusText + '\\n' + JSON.stringify(data, null, 2);
      } catch (err) {
        viewer.textContent = 'Error fetching: ' + err.message;
      }
    }
  </script>
</body>
</html>
  `);
});

// ============================================================================
// API Routing
// ============================================================================
app.use("/api/students", apiRoutes);

// Fallback for /api
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Welcome to Student Placement Tracker REST API",
    version: "1.0.0",
    documentation: "/",
    endpoints: {
      getAllStudents: "GET /api/students",
      getStats: "GET /api/students/stats",
      getById: "GET /api/students/:id",
      create: "POST /api/students",
      update: "PUT /api/students/:id",
      delete: "DELETE /api/students/:id",
      reset: "POST /api/students/reset"
    }
  });
});

// ============================================================================
// Error Handling Middleware
// ============================================================================

// Intercept 404 Not Found for undefined routes
app.use(notFoundHandler);

// Centralized global error handler
app.use(errorHandler);

// ============================================================================
// Server Initialization
// ============================================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Student Placement API running on port ${PORT}`);
    console.log(`📡 Local Server: http://localhost:${PORT}`);
    console.log(`📑 API Explorer: http://localhost:${PORT}/`);
    console.log(`👥 Endpoints:    http://localhost:${PORT}/api/students`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
