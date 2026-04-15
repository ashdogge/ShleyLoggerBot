const https = require("https");
const LOCAL_VERSION = process.env.LOGGER_VERSION || "3.0.1";

function checkLoggerVersion() {
  const url = "https://shleys.bhweb.ws/api/loggerVersionCheck";
  https
    .get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const latest = JSON.parse(data).version;
          if (latest !== LOCAL_VERSION) {
            console.log(
              `New version available: ${latest}. Update recommended!`,
            );
          }
        } catch (e) {
          console.error("Logger version check failed:", e.message);
        }
      });
    })
    .on("error", (err) => console.error("Version check error:", err.message));
}

module.exports = { checkLoggerVersion };
