/**
 * In-Memory Mock Database for Student Placement Tracker API
 * Contains initial seed records for testing pagination, filtering, and CRUD operations.
 */

const initialStudents = [
  {
    id: 1,
    name: "Aarav Sharma",
    rollNumber: "CS2021001",
    email: "aarav.sharma@college.edu",
    department: "Computer Science",
    cgpa: 9.2,
    skills: ["JavaScript", "Node.js", "React", "MongoDB"],
    placementStatus: "Placed",
    company: "Google",
    packageOffered: 3200000, // INR per annum
    placedDate: "2024-09-15",
    createdAt: "2024-08-01T10:00:00.000Z"
  },
  {
    id: 2,
    name: "Priya Patel",
    rollNumber: "CS2021045",
    email: "priya.patel@college.edu",
    department: "Computer Science",
    cgpa: 8.8,
    skills: ["Java", "Spring Boot", "AWS", "Docker"],
    placementStatus: "Placed",
    company: "Amazon",
    packageOffered: 2800000,
    placedDate: "2024-09-20",
    createdAt: "2024-08-01T10:15:00.000Z"
  },
  {
    id: 3,
    name: "Rohan Verma",
    rollNumber: "IT2021012",
    email: "rohan.verma@college.edu",
    department: "Information Technology",
    cgpa: 7.9,
    skills: ["Python", "Django", "SQL", "Git"],
    placementStatus: "Interviewing",
    company: "Infosys",
    packageOffered: null,
    placedDate: null,
    createdAt: "2024-08-02T11:00:00.000Z"
  },
  {
    id: 4,
    name: "Sneha Reddy",
    rollNumber: "EC2021088",
    email: "sneha.reddy@college.edu",
    department: "Electronics & Communication",
    cgpa: 8.4,
    skills: ["C++", "Embedded Systems", "IoT", "MATLAB"],
    placementStatus: "Placed",
    company: "Qualcomm",
    packageOffered: 1800000,
    placedDate: "2024-09-28",
    createdAt: "2024-08-03T09:30:00.000Z"
  },
  {
    id: 5,
    name: "Aditya Kulkarni",
    rollNumber: "CS2021102",
    email: "aditya.kulkarni@college.edu",
    department: "Computer Science",
    cgpa: 7.4,
    skills: ["HTML", "CSS", "JavaScript", "Vue.js"],
    placementStatus: "Unplaced",
    company: null,
    packageOffered: null,
    placedDate: null,
    createdAt: "2024-08-03T14:20:00.000Z"
  },
  {
    id: 6,
    name: "Ananya Iyer",
    rollNumber: "IT2021054",
    email: "ananya.iyer@college.edu",
    department: "Information Technology",
    cgpa: 9.0,
    skills: ["Node.js", "Express", "TypeScript", "PostgreSQL"],
    placementStatus: "Placed",
    company: "Microsoft",
    packageOffered: 3500000,
    placedDate: "2024-10-02",
    createdAt: "2024-08-04T12:00:00.000Z"
  },
  {
    id: 7,
    name: "Vikram Malhotra",
    rollNumber: "ME2021023",
    email: "vikram.malhotra@college.edu",
    department: "Mechanical Engineering",
    cgpa: 7.8,
    skills: ["AutoCAD", "SolidWorks", "Python", "Ansys"],
    placementStatus: "Placed",
    company: "Tata Motors",
    packageOffered: 950000,
    placedDate: "2024-10-05",
    createdAt: "2024-08-05T08:45:00.000Z"
  },
  {
    id: 8,
    name: "Kavya Nair",
    rollNumber: "CS2021077",
    email: "kavya.nair@college.edu",
    department: "Computer Science",
    cgpa: 8.6,
    skills: ["Python", "TensorFlow", "PyTorch", "NLP"],
    placementStatus: "Interviewing",
    company: "NVIDIA",
    packageOffered: null,
    placedDate: null,
    createdAt: "2024-08-06T15:10:00.000Z"
  },
  {
    id: 9,
    name: "Devendra Singh",
    rollNumber: "EC2021041",
    email: "devendra.singh@college.edu",
    department: "Electronics & Communication",
    cgpa: 6.9,
    skills: ["VLSI", "Verilog", "C", "Linux"],
    placementStatus: "Unplaced",
    company: null,
    packageOffered: null,
    placedDate: null,
    createdAt: "2024-08-07T11:25:00.000Z"
  },
  {
    id: 10,
    name: "Meera Joshi",
    rollNumber: "IT2021099",
    email: "meera.joshi@college.edu",
    department: "Information Technology",
    cgpa: 8.2,
    skills: ["Cybersecurity", "Networking", "Python", "Ethical Hacking"],
    placementStatus: "Placed",
    company: "PwC",
    packageOffered: 1200000,
    placedDate: "2024-10-10",
    createdAt: "2024-08-08T16:40:00.000Z"
  },
  {
    id: 11,
    name: "Arjun Das",
    rollNumber: "CS2021115",
    email: "arjun.das@college.edu",
    department: "Computer Science",
    cgpa: 8.1,
    skills: ["React Native", "Flutter", "Firebase", "Kotlin"],
    placementStatus: "Placed",
    company: "Swiggy",
    packageOffered: 1600000,
    placedDate: "2024-10-12",
    createdAt: "2024-08-09T13:30:00.000Z"
  },
  {
    id: 12,
    name: "Tanvi Deshmukh",
    rollNumber: "ME2021067",
    email: "tanvi.deshmukh@college.edu",
    department: "Mechanical Engineering",
    cgpa: 7.2,
    skills: ["Supply Chain", "Python", "Data Analysis", "Excel"],
    placementStatus: "Unplaced",
    company: null,
    packageOffered: null,
    placedDate: null,
    createdAt: "2024-08-10T10:05:00.000Z"
  }
];

// In-memory working copy
let students = JSON.parse(JSON.stringify(initialStudents));

// ID auto-increment tracker
let nextId = 13;

module.exports = {
  getStudents: () => students,
  setStudents: (newStudents) => {
    students = newStudents;
  },
  getNextId: () => nextId++,
  resetData: () => {
    students = JSON.parse(JSON.stringify(initialStudents));
    nextId = 13;
    return students;
  }
};
