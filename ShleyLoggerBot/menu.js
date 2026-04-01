const readline = require("readline");
const fs = require("fs");
const path = require("path");
const envFilePath = path.join(process.cwd(), ".env");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function displayPrompt(port) {
  console.log(`Server running on http://localhost:${port}`);
  console.log("Main Menu:\n1) Help\n2) Toggle Timestamps\n3) Quit");
  rl.prompt();
}

function handleMenuInput(line) {
  const command = line.trim();
  switch (command) {
    case "1":
      console.log("Help: Available commands...");
      break;
    case "2":
      toggleTimestamps();
      break;
    case "3":
      process.exit(0);
      break;
    default:
      console.log("Unknown command");
      break;
  }
  displayPrompt();
}

function toggleTimestamps() {
  let data = fs.readFileSync(envFilePath, "utf8");
  if (data.includes("TIMESTAMPS=true")) {
    data = data.replace("TIMESTAMPS=true", "TIMESTAMPS=false");
    console.log("Timestamps OFF");
  } else {
    data = data.replace("TIMESTAMPS=false", "TIMESTAMPS=true");
    console.log("Timestamps ON");
  }
  fs.writeFileSync(envFilePath, data);
}
module.exports = { rl, displayPrompt, handleMenuInput };
