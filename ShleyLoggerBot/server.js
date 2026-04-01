// server.js
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const app = require("./app.js");
const { rl, displayPrompt, handleMenuInput } = require("./menu.js");
const { checkLoggerVersion } = require("./version.js");
const runSetup = require("./setup.js");

const envFilePath = path.join(process.cwd(), ".env");

// Restart helper
function restartProcess() {
  const child = spawn(process.argv[0], process.argv.slice(1), {
    detached: true,
    stdio: "inherit",
  });
  child.unref();
  process.exit(0);
}

// Wrap server boot in async IIFE
(async () => {
  // First-run setup
  if (!fs.existsSync(envFilePath)) {
    await runSetup();
    restartProcess(); // restart to load new .env
  }

  // Load environment variables
  const dotenv = require("dotenv");
  dotenv.config({ path: envFilePath });

  // Server setup
  const port = process.env.PORT || 4000;
  app.set("port", port);

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    checkLoggerVersion();
    displayPrompt(port);
  });

  // CLI input
  rl.on("line", handleMenuInput);
})();
