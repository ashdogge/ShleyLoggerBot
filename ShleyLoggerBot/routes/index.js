// routes/message.js
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const MAX_MESSAGE_LENGTH = 1750; // below Discord 2000 limit
const UA = "game=ConanSandbox, engine=UE4";

/*
|--------------------------------------------------------------------------
| Runtime Settings
|--------------------------------------------------------------------------
*/

function timestampsEnabled() {
  return process.env.TIMESTAMPS === "true";
}

/*
|--------------------------------------------------------------------------
| Encoding Recovery
|--------------------------------------------------------------------------
| Conan Exiles sometimes sends UTF-8 interpreted as Latin1.
| This restores characters like “ ” ’ — etc.
*/
function recoverUTF8(input = "") {
  try {
    return Buffer.from(input, "latin1").toString("utf8");
  } catch {
    return input;
  }
}

/*
|--------------------------------------------------------------------------
| Text Normalization
|--------------------------------------------------------------------------
*/
function normalizeText(str = "") {
  return str.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/—/g, "-");
}

/*
|--------------------------------------------------------------------------
| Discord Sender
|--------------------------------------------------------------------------
*/
async function sendToDiscord(content) {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, { content });
  } catch (error) {
    console.error(
      "Discord webhook error:",
      error.response?.data || error.message,
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET /message
|--------------------------------------------------------------------------
*/
router.get("/", async (req, res) => {
  try {
    const { rawMessage, message, sender, character } = req.query;
    const userAgent = req.get("User-Agent") || "Unknown";

    const incomingMessage = rawMessage || message;

    const cleanedMessage = normalizeText(recoverUTF8(incomingMessage || ""));

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!userAgent.includes(UA)) {
      console.warn(`Blocked client mismatch: ${userAgent}`);
      return res.status(403).json({ error: "UA mismatch" });
    }

    if (!cleanedMessage.trim()) {
      return res.status(400).json({
        error: "Message cannot be empty.",
      });
    }

    if (!DISCORD_WEBHOOK_URL) {
      console.error("Missing DISCORD_WEBHOOK_URL");
      return res.status(500).json({
        error: "Webhook not configured.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Formatting
    |--------------------------------------------------------------------------
    */

    const player = sender || "Unknown";
    const charName = character && sender !== character ? `(${character})` : "";

    const timestamp = new Date().toLocaleString("en-US", {
      hour12: false,
    });

    /*
    |--------------------------------------------------------------------------
    | Message Splitting
    |--------------------------------------------------------------------------
    */

    if (cleanedMessage.length > MAX_MESSAGE_LENGTH) {
      const parts = [];

      for (let i = 0; i < cleanedMessage.length; i += MAX_MESSAGE_LENGTH) {
        parts.push(cleanedMessage.substring(i, i + MAX_MESSAGE_LENGTH));
      }

      for (let i = 0; i < parts.length; i++) {
        const content = timestampsEnabled()
          ? `[${timestamp}] [ **${player} ${charName}** ] (${i + 1}/${
              parts.length
            }):\n${parts[i]}`
          : `[ **${player} ${charName}** ] (${i + 1}/${parts.length}):\n${
              parts[i]
            }`;

        await sendToDiscord(content);
      }
    } else {
      const content = timestampsEnabled()
        ? `[${timestamp}] [ **${player} ${charName}** ]: ${cleanedMessage}`
        : `[ **${player} ${charName}** ]: ${cleanedMessage}`;

      await sendToDiscord(content);
    }

    return res.json({
      success: true,
      message: "Sent to Discord",
    });
  } catch (error) {
    console.error("Route failure:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Failed to send message to Discord",
    });
  }
});

module.exports = router;
