const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const leetcodeController = express.Router();

const fetchLeetcodeProblemsSolved = async (username) => {
  try {
    const response = await axios.get(
      `https://leetcode-stats-api.herokuapp.com/${username}`
    );
    const data = response.data;

    if (data.status !== "success") {
      throw new Error("Failed to retrieve data");
    }

    return {
      totalQuestionsSolved: data.totalSolved,
      easySolved: data.easySolved,
      totalEasy: data.totalEasy,
      mediumSolved: data.mediumSolved,
      totalMedium: data.totalMedium,
      hardSolved: data.hardSolved,
      totalHard: data.totalHard,
    };
  } catch (error) {
    console.error(
      `Error fetching Leetcode problems solved for ${username}:`,
      error
    );
    return null;
  }
};

const fetchLeetcodeContestRating = async (username) => {
  try {
    const query = `
      query {
        userContestRanking(username: "${username}") {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
        }
      }
    `;
    const response = await axios.post("https://leetcode.com/graphql", {
      query,
    });
    const data = response.data;

    if (!data.data || data.data.userContestRanking === null) {
      // Return null values if userContestRanking is null
      return {
        contestsAttended: null,
        contestRating: null,
        globalRanking: null,
        totalParticipants: null,
        topPercentage: null,
      };
    }

    return {
      contestsAttended: data.data.userContestRanking.attendedContestsCount,
      contestRating: data.data.userContestRanking.rating,
      globalRanking: data.data.userContestRanking.globalRanking,
      totalParticipants: data.data.userContestRanking.totalParticipants,
      topPercentage: data.data.userContestRanking.topPercentage,
    };
  } catch (error) {
    console.error(
      `Error fetching Leetcode contest rating for ${username}:`,
      error
    );
    return null;
  }
};

leetcodeController.get("/fetch-details", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const leetcodeProblemsSolved = await fetchLeetcodeProblemsSolved(username);
    const leetcodeContestRating = await fetchLeetcodeContestRating(username);

    if (!leetcodeProblemsSolved || leetcodeContestRating === null) {
      return res.status(500).json({ message: "Failed to retrieve data" });
    }

    res.json({
      leetcode: {
        ...leetcodeProblemsSolved,
        ...leetcodeContestRating,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = leetcodeController;
