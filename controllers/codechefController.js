const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const codechefController = express.Router();

const fetchCodechefUserInfo = async (username) => {
  try {
    const response = await axios.get(
      `https://codechef-api.vercel.app/${username}`
    );
    const data = response.data;

    if (!data.success) {
      throw new Error("Failed to retrieve data");
    }

    return {
      name: data.name,
      currentRating: data.currentRating,
      highestRating: data.highestRating,
      countryFlag: data.countryFlag,
      countryName: data.countryName,
      globalRank: data.globalRank,
      countryRank: data.countryRank,
      stars: data.stars,
    };
  } catch (error) {
    console.error(
      `Error fetching CodeChef user info for ${username}:`,
      error
    );
    return null;
  }
};

codechefController.get("/fetch-details", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const userInfo = await fetchCodechefUserInfo(username);

    if (!userInfo) {
      return res.status(500).json({ message: "Failed to retrieve data" });
    }

    res.json({
      codechef: userInfo,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = codechefController;
