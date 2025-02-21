const express = require("express");
const router = express.Router();
const axios = require("axios");
// discord webhook url goes here
require("dotenv").config();
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

router.get(`/message`, async (req, res) => {
  try {
    const { message, sender, character } = req.query;

    // Default values to prevent undefined output
    const player = sender || "Unknown";
    const charName = character && sender !== character ? `(${character})` : "";

    // Improved formatting for readability
    const content = `[ **${player} ${charName}** ]: ${
      message || "No message provided"
    }`;
    //send message to discord webhook
    await axios.post(DISCORD_WEBHOOK_URL, { content });
    //Catch true/false response
    res.json({ success: true, message: "Sent to Discord" });
  } catch (error) {
    console.error(
      "Error sending message to Discord:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to send message to Discord" });
  }
});

module.exports = router;
