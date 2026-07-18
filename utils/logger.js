const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "system.log");

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

const logStream = fs.createWriteStream(LOG_FILE, {
    flags: "a",
    encoding: "utf8",
});

logStream.on("error", (err) => {
    console.error("Logger stream error:", err);
});

function getTimestamp() {
    return dateFormatter.format(new Date());
}

function write(level, message, options = {}) {
    const {
        toConsole = true,
        toFile = true,
    } = options;

    const log = `[${getTimestamp()}] ${level.padEnd(5)} ${message}`;

    if (toConsole) {
        console.log(log);
    }

    if (toFile) {
        logStream.write(log + "\n");
    }
}

module.exports = {
    info(message) {
        write("INFO", message);
    },

    warn(message) {
        write("WARN", message);
    },

    error(message, err = null) {
        write("ERROR", message);

        if (err) {
            if (err.message) {
                write("ERROR", `Details: ${err.message}`);
            }

            if (err.stack) {
                logStream.write(`${err.stack}\n`);
            }
        }
    },

    debug(message) {
        if (process.env.DEBUG === "true") {
            write("DEBUG", message);
        }
    },
};