const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  platforms: {
    leetcode: { type: String, default: "" },
    codeforces: { type: String, default: "" },
    codechef: { type: String, default: "" },
    hackerrank: { type: String, default: "" },
  },
  profileImg: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model('User', UserSchema);
