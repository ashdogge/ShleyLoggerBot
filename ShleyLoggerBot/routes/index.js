const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TIMESTAMPS_ENABLED = process.env.TIMESTAMPS === "true"; // Check if timestamps are enabled
const MAX_MESSAGE_LENGTH = 1750; // Discord has a 2000-character limit, leaving buffer space
const UA = "game=ConanSandbox, engine=UE4";

router.get(`/message`, async (req, res) => {
  try {
    const { message, sender, character } = req.query;
    const userAgent = req.get("User-Agent") || "Unknown";

    if (!userAgent.includes(UA)) {
      console.warn(`Blocked client mismatch: ${userAgent}`);
      return res.status(403).json({ error: "UA mismatch" });
    }


    if (!message) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    const player = sender || "Unknown";
    const charName = character && sender !== character ? `(${character})` : "";
    const timestamp = new Date().toLocaleString("en-US", { hour12: false });

    // Function to send a message to Discord
    async function sendToDiscord(content) {
      try {
        await axios.post(DISCORD_WEBHOOK_URL, { content });
      } catch (error) {
        console.error(
          "Error sending message to Discord:",
          error.response?.data || error.message
        );
      }
    }

    // Split long messages
    if (message.length > MAX_MESSAGE_LENGTH) {
      console.log(
        `Message is too long (${message.length} chars), splitting...`
      );
      const messageParts = [];

      for (let i = 0; i < message.length; i += MAX_MESSAGE_LENGTH) {
        messageParts.push(message.substring(i, i + MAX_MESSAGE_LENGTH));
      }

      // Send each part separately
      for (let i = 0; i < messageParts.length; i++) {
        const partContent = TIMESTAMPS_ENABLED
          ? `[${timestamp}] [ **${player} ${charName}** ] (${i + 1}/${
              messageParts.length
            }):\n${messageParts[i]}`
          : `[ **${player} ${charName}** ] (${i + 1}/${
              messageParts.length
            }):\n${messageParts[i]}`;

        await sendToDiscord(partContent);
      }
    } else {
      // Send normally if the message is short
      const content = TIMESTAMPS_ENABLED
        ? `[${timestamp}] [ **${player} ${charName}** ]: ${message}`
        : `[ **${player} ${charName}** ]: ${message}`;

      await sendToDiscord(content);
    }

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
