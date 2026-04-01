const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { clear } = require("console");
const envFilePath = path.join(process.cwd(), ".env");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function checkPadding(padding) {
  if (padding % 2 !== 0) {
    return padding - 1;
  } else {
    return padding;
  }
}

function addPadding(content) {
  const l = content.length;
  const line = 48;
  var padding = Math.round((line - l) / 2);

  console.log(
    `║` +
      ` `.repeat(padding) +
      `${content}` +
      ` `.repeat(checkPadding(padding)) +
      `║`,
  );
}

function cleanMenuStart() {
  console.log(`╔` + `═`.repeat(48) + `╗`);
}
function cleanMenuEnd() {
  console.log(`╚` + `═`.repeat(48) + `╝`);
}
function displayPrompt(
  port = process.env.PORT || 4000,
  version = process.env.LOGGER_VERSION,
) {
  cleanMenuStart();
  addPadding(`ShleyLogger running on http://localhost:${port}`);
  addPadding(`Version ${version}  `);
  addPadding(`1) Help`);
  addPadding(`2) Toggle Timestamps`);
  addPadding(`3) Quit`);
  cleanMenuEnd();
  console.log("\n");
  rl.prompt();
}

function handleMenuInput(line) {
  const command = line.trim();
  switch (command) {
    case "1":
      console.log(
        "Help: Instructions at https://github.com/ashdogge/ShleyLoggerBot",
      );
      console.log(
        "Re-run setup by deleting .env file in folder with the .exe!",
      );
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
  displayPrompt(process.env.PORT || 4000);
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

  // reload environment vars
  require("dotenv").config({ override: true });
}
module.exports = { rl, displayPrompt, handleMenuInput };
