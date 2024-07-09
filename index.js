const express = require('express');
const leetcodeController = require('./controllers/leetcodeController');
const authController = require("./controllers/authController")
const codeforcesController = require("./controllers/codeforcesController")
const codechefController = require("./controllers/codechefController") 
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const port = process.env.PORT || 5000;

app.use(express.json());
// mongoose.set("strictQuery", false);
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => {
//     console.log("MONGODB has been started");
//   })
//   .catch((err) => {
//     console.error("Failed to connect to MongoDB", err);
//   });
app.use("/auth", authController);
app.use("/leetcode", leetcodeController);
app.use("/codeforces", codeforcesController);
app.use("/codechef", codechefController);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
