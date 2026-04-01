const fs = require("fs");
const { rl, displayPrompt } = require("./menu.js");
const path = require("path");
const envFilePath = path.join(process.cwd(), ".env");

module.exports = function runSetup() {
  return new Promise((resolve) => {
    let currentStep = "webhook";
    let url = "";
    let timestamps = "";
    let port = "4000";
    let loggerVersion = "2.5.1";

    console.log("\n=== First-Time Setup Wizard ===\n");
    console.log(
      "Enter your Discord Webhook URL:\nhttps://tinyurl.com/5b25pp53",
    );

    rl.on("line", (input) => {
      input = input.trim();

      switch (currentStep) {
        case "webhook":
          if (!input.startsWith("https://")) {
            console.log("❌ Must start with https://");
            return;
          }

          url = input;
          currentStep = "timestamps";
          console.log("Enable timestamps?\n1) Yes\n2) No");
          break;

        case "timestamps":
          if (input !== "1" && input !== "2") {
            console.log("Choose 1 or 2");
            return;
          }

          timestamps = input === "1" ? "true" : "false";
          currentStep = "port";
          console.log("Custom port? (blank = 4000)");
          break;

        case "port":
          if (input) {
            if (isNaN(input) || parseInt(input) <= 0) {
              console.log("Invalid port.");
              return;
            }
            port = input;
          }

          saveConfig();
          break;
      }
    });

    function saveConfig() {
      const content = `DISCORD_WEBHOOK_URL=${url}
PORT=${port}
TIMESTAMPS=${timestamps}
LOGGER_VERSION=${loggerVersion}`;

      fs.writeFileSync(envFilePath, content);

      console.log("\n✅ Configuration saved!");
      rl.close();
      resolve();
    }
  });
};
