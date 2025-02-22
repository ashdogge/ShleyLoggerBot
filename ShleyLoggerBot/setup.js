const fs = require("fs");
const readLine = require("readLine");
const path = require("path");
//Path to the .env
const envPath = path.join(__dirname, ".env");

//get the webhook url
function promptWebhookUrl() {
  //instanciate the interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter your Discord Webhook URL: ", (url) => {
    if (!url.startsWith("https://")) {
      console.error('Please enter a valid URL starting with "https://".');
      rl.close();
      return;
    }
    // Write or update the .env file with the webhook URL
    const content = `DISCORD_WEBHOOK_URL=${url}\nPORT=4000\n`; // Add other env variables as needed
    fs.writeFile(envPath, content, (err) => {
      if (err) {
        console.error("Error writing to .env file:", err);
      } else {
        console.log("Webhook URL saved to .env file.");
      }
      rl.close();
    });
  });
}

if (!fs.existsSync(envPath)) {
  console.log(".env not found. Creating .env");
  promptWebhookUrl();
} else {
  //Check that DISCORD_WEBHOOK_URL exists
  if (!envContent.includes("DISCORD_WEBHOOK_URL")) {
    console.log("Couldn't find DISCORD_WEBHOOK_URL in .env.");
    promptWebhookUrl();
  } else {
    console.log("Webhook URL already exist env.");
  }
}
