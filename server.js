const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Fake user database (can be extended to database for production)
const users = {
  "admin": "adminpassword", // Admin user with permission to upload files
  "student1": "password123",
  "student2": "pass456"
};

// In-memory like counters for PDFs
const likeCounter = {
  "sub1": 0,
  "sub2": 0,
  "sub3": 0
};

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.body.folder;
    const uploadPath = path.join(__dirname, "uploads", folder);
    cb(null, uploadPath); // Files will be uploaded to this folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Timestamp file name
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Handle login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username] === password) {
    if (username === "admin") {
      res.redirect("/admin"); // Admin page for uploading files
    } else {
      res.redirect("/home"); // Normal user homepage
    }
  } else {
    res.send("Invalid username or password. Please go back and try again.");
  }
});

// Serve home page for normal users
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Serve admin page for file uploads
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

// Handle file upload by admin
app.post("/upload", upload.single("file"), (req, res) => {
  res.send("File uploaded successfully!");
});

// Serve folder page with PDFs (accessible to both admin and normal users)
app.get("/folder/:folderName", (req, res) => {
  const folderName = req.params.folderName;
  res.sendFile(path.join(__dirname, "views", "folder.html"));
});

// Handle like button for PDFs
app.post("/like/:folderName", (req, res) => {
  const folderName = req.params.folderName;
  if (likeCounter[folderName] !== undefined) {
    likeCounter[folderName]++;
  }
  res.redirect(`/folder/${folderName}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
