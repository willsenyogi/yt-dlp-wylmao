const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "system.log");

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function write(level, message, toConsole = true) {
    const timestamp = new Date().toLocaleString("en-GB", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const log = `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}`;

    if (toConsole) {
        console.log(log);
    }

    fs.appendFileSync(LOG_FILE, log + "\n");
}

module.exports = {
    info(message) {
        write("INFO", message);
    },

    warn(message) {
        write("WARN", message);
    },

    error(message, err) {
        write("ERROR", message);
        if (err) {
            write("ERROR", `Details: ${err.message}`);
            if (err.stack) {
                write("ERROR", `Stack: ${err.stack}`);
            }
        }
    },

    debug(message) {
        write("DEBUG", message, false);
    }
};