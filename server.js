const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Route 1: Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running fine"
  });
});


//  Route 2: Home
 
app.get("/", (req, res) => {
  res.send("Welcome to my Node.js server on AWS EC2");
});

// Route 3: Data Endpoint
app.post("/data", (req, res) => {
  const body = req.body;

  res.json({
    success: true,
    receivedData: body
  });
});
   // sever listening
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});