const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const codeforcesController = express.Router();

const fetchCodeforcesUserInfo = async (username) => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}&checkHistoricHandles=false`
    );
    const data = response.data;

    if (data.status !== "OK") {
      throw new Error("Failed to retrieve data");
    }

    const userInfo = data.result[0];
    return {
      rating: userInfo.rating,
      rank: userInfo.rank,
      maxRating: userInfo.maxRating,
      maxRank: userInfo.maxRank,
      organization: userInfo.organization,
      titlePhoto: userInfo.titlePhoto,
      avatar: userInfo.avatar,
    };
  } catch (error) {
    console.error(
      `Error fetching Codeforces user info for ${username}:`,
      error
    );
    return null;
  }
};

codeforcesController.get("/fetch-details", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const userInfo = await fetchCodeforcesUserInfo(username);

    if (!userInfo) {
      return res.status(500).json({ message: "Failed to retrieve data" });
    }

    res.json({
      codeforces: userInfo,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = codeforcesController;
