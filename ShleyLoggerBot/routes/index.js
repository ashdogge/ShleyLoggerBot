// routes/message.js
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config(); // load environment variables

const router = express.Router();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
function timestampsEnabled() {
  return process.env.TIMESTAMPS === "true";
}
const MAX_MESSAGE_LENGTH = 1750; // leave some buffer below Discord 2000-char limit
const UA = "game=ConanSandbox, engine=UE4";

/**
 * GET /message
 * Sends a message to Discord webhook.
 * Query params:
 *   - message: string (required)
 *   - sender: string (optional)
 *   - character: string (optional)
 */
router.get("/", async (req, res) => {
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
          error.response?.data || error.message,
        );
      }
    }

    // Split long messages if needed
    if (message.length > MAX_MESSAGE_LENGTH) {
      const messageParts = [];
      for (let i = 0; i < message.length; i += MAX_MESSAGE_LENGTH) {
        messageParts.push(message.substring(i, i + MAX_MESSAGE_LENGTH));
      }

      for (let i = 0; i < messageParts.length; i++) {
        const partContent = timestampsEnabled()
          ? `[${timestamp}] [ **${player} ${charName}** ] (${i + 1}/${
              messageParts.length
            }):\n${messageParts[i]}`
          : `[ **${player} ${charName}** ] (${i + 1}/${
              messageParts.length
            }):\n${messageParts[i]}`;

        await sendToDiscord(partContent);
      }
    } else {
      const content = timestampsEnabled()
        ? `[${timestamp}] [ **${player} ${charName}** ]: ${message}`
        : `[ **${player} ${charName}** ]: ${message}`;

      await sendToDiscord(content);
    }

    res.json({ success: true, message: "Sent to Discord" });
  } catch (error) {
    console.error(
      "Error sending message to Discord:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to send message to Discord" });
  }
});
module.exports = router;
