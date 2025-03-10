const fs = require("fs");
const readline = require("readline");
const path = require("path");

// Path to the .env file
const envFilePath = path.join(__dirname, ".env");
let currentStep = "webhook"; // Track which step the user is on
let url = "";
let timestamps = "";
let port = "4000"; // Default port
//Current logger version
let loggerVersion = "2.5.1";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Setup Wizard: Follow the prompts below to configure your bot.");
console.log(
  "Enter your Discord Webhook URL (instructions for setting one up here: https://tinyurl.com/5b25pp53): "
);

rl.on("line", (input) => {
  input = input.trim();

  switch (currentStep) {
    case "webhook":
      if (!input.startsWith("https://")) {
        console.log(
          '❌ Invalid URL. Please enter a valid URL starting with "https://":'
        );
        return; // Do NOT advance to the next step
      }
      url = input;
      currentStep = "timestamps";
      console.log("Do you want timestamps on each message?\n1) Yes\n2) No");
      break;

    case "timestamps":
      if (input !== "1" && input !== "2") {
        console.log("❌ Invalid input. Please choose 1 for Yes, or 2 for No:");
        return;
      }
      timestamps = input === "1" ? "true" : "false";
      currentStep = "port";
      console.log("Specify a custom port? (Leave blank for default 4000)");
      break;

    case "port":
      if (input) {
        if (isNaN(input) || parseInt(input) <= 0) {
          console.log("❌ Invalid port number. Please enter a valid port:");
          return;
        }
        port = input;
      }
      saveConfig();
      break;
  }
});

// Save the data and close the readline interface
function saveConfig() {
  const content = `DISCORD_WEBHOOK_URL=${url}\nPORT=${port}\nTIMESTAMPS=${timestamps}\nLOGGER_VERSION=${loggerVersion}`;
  fs.writeFile(envFilePath, content, (err) => {
    if (err) {
      console.error("❌ Error writing to .env file:", err);
    } else {
      console.log("✅ Configuration saved successfully to .env!");
    }
    rl.close();
  });
}
