const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
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
  bio: { type: String, default: "" },
  organization: { type: String, default: "" },
  country: { type: String, default: "" },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);
