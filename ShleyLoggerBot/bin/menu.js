const readline = require("readline");
const { execSync } = require("child_process");
const path = require("path"); // Import path module
const fs = require("fs");
const envFilePath = path.join(__dirname, "../.env");
// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

// Menu state
let currentMenu = "main";
const menuWidth = 78;
const topBorder = "╔" + "═".repeat(menuWidth - 2) + "╗";
const bottomBorder = "╚" + "═".repeat(menuWidth - 2) + "╝";
// Display the menu
function displayPrompt(port) {
  if (currentMenu === "main") {
    console.log();
    console.log(
      `${topBorder}\n` +
        centeredMenuBox(`Server running on http://localhost:${port}`) +
        centeredMenuBox(``) +
        centeredMenuBox("1) Help!") +
        centeredMenuBox("2) Settings") +
        centeredMenuBox("6) Quit") +
        `${bottomBorder}`
    );
  } else if (currentMenu === "settings") {
    console.log(
      `${topBorder}\n` +
        centeredMenuBox("1) Toggle timestamps") +
        centeredMenuBox("2) Delete .env - rerun setup") +
        centeredMenuBox("6) Back to main") +
        `${bottomBorder}`
    );
  }
  rl.prompt();
}

// Function to handle menu input
function handleMenuInput(command, settingToggler, port) {
  command = command.trim();

  if (currentMenu === "main") {
    switch (command) {
      case "1":
        console.log(
          "Documentation at:https://docs.google.com/document/d/1OOgExWKhftTUrlqOEAg37hNKAoRkdQTcBGMrS27CqWg/edit?usp=sharing \nStill stuck? https://shleys.bhweb.ws/about"
        );
        break;
      case "2":
        currentMenu = "settings";
        break;
      case "6":
        process.exit(0);
        break;
      default:
        console.log(
          centeredMenuBox(
            `||>>>><<<<|| Unknown command: ${command} ||>>>><<<<||`
          )
        );
        break;
    }
  } else if (currentMenu === "settings") {
    switch (command) {
      case "1":
        settingToggler("1");
        break;
      case "2":
        resetEnvAndRunSetup(rl, displayPrompt, port);
        break;
      case "6":
        currentMenu = "main";
        break;
      default:
        console.log(
          centeredMenuBox(
            `||>>>><<<<|| Unknown command: ${command} ||>>>><<<<||`
          )
        );
        break;
    }
  }
  displayPrompt(port);
}
// Function to create a centered menu box
function centeredMenuBox(string) {
  //Declare consts

  const paddingl = (menuWidth - 2 - string.length) / 2;
  var paddingr = (menuWidth - 2 - string.length) / 2;
  if (string.length % 2 !== 0) {
    paddingr++;
  }
  return (
    "║" + " ".repeat(paddingl) + `${string}` + " ".repeat(paddingr) + "║\n"
  );
}
function resetEnvAndRunSetup(rl, displayPrompt, port) {
  try {
    // Delete .env file
    if (fs.existsSync(envFilePath)) {
      fs.unlinkSync(envFilePath);
      console.log(".env file deleted successfully.");
    } else {
      console.log("No .env file found.");
    }

    // Run setup.js
    console.log("🔄 Running setup script...");
    execSync("node setup.js", { stdio: "inherit" });

    console.log("✅ Setup complete! Rerun run.bat.");
    process.exit(0); // Restart process after setup completes
  } catch (error) {
    console.error("Error during reset:", error);
  }
}
// Export functions and readline interface
module.exports = {
  rl,
  displayPrompt,
  handleMenuInput,
  centeredMenuBox,
  resetEnvAndRunSetup,
};
