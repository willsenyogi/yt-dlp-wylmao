const path = require("path");
const ytDlp = require("yt-dlp-exec");

const paths = require("../utils/paths");
const logger = require("../utils/logger");
const progress = require("../utils/progress");

const PROGRESS_RENDER_INTERVAL = 800; // ms
const PROGRESS_LOG_INTERVAL = 8000;   // ms
const PROGRESS_RENDER_STEP = 3.5;     // %

async function getInfo(url) {
    return ytDlp(url, {
        dumpJson: true,
    });
}

function shouldRenderProgress(progressData, state, now) {
    const percentageChanged =
        progressData.percentage - state.lastRenderedPercentage >=
        PROGRESS_RENDER_STEP;

    const renderTimedOut =
        now - state.lastRenderTime >= PROGRESS_RENDER_INTERVAL;

    return percentageChanged || renderTimedOut;
}

async function executeDownload(url, options) {
    return new Promise((resolve, reject) => {
        const child = ytDlp.exec(url, {
            output: path.join(paths.downloads, "%(title)s.%(ext)s"),
            noWarnings: true,
            noCallHome: true,
            ...options,
        });

        const state = {
            stdoutBuffer: "",
            stderrBuffer: "",
            lastLogTime: 0,
            lastRenderTime: 0,
            lastRenderedPercentage: Number.NEGATIVE_INFINITY,
        };

        function handleData(data, bufferKey) {
            state[bufferKey] += data.toString();

            const lines = state[bufferKey].split(/\r?\n|\r/);
            state[bufferKey] = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) {
                    continue;
                }

                const progressData = progress.parseProgressLine(line);

                // Ignore non-progress output
                if (!progressData) {
                    // Uncomment if needed for debugging
                    // logger.debug(`yt-dlp output: ${line}`);
                    continue;
                }

                const now = Date.now();

                if (shouldRenderProgress(progressData, state, now)) {
                    progress.renderProgress(progressData);

                    state.lastRenderTime = now;
                    state.lastRenderedPercentage = progressData.percentage;
                }

                if (now - state.lastLogTime >= PROGRESS_LOG_INTERVAL) {
                    logger.info(
                        `Progress: ${progressData.percentage.toFixed(1)}% | Size: ${progressData.fileSize} | Speed: ${progressData.speed} | ETA: ${progressData.etaFormatted}`
                    );

                    state.lastLogTime = now;
                }
            }
        }

        child.stdout.on("data", (data) => {
            handleData(data, "stdoutBuffer");
        });

        child.stderr.on("data", (data) => {
            handleData(data, "stderrBuffer");
        });

        child.on("close", (code) => {
            process.stdout.write("\n");

            if (code === 0) {
                logger.info("Download completed successfully.");
                resolve();
                return;
            }

            logger.error(`yt-dlp exited with code ${code}.`);
            reject(new Error(`yt-dlp exited with code ${code}`));
        });

        child.on("error", (err) => {
            logger.error("Failed to execute yt-dlp.", err);
            reject(err);
        });
    });
}

async function downloadVideo(url, format = "bv*+ba/b") {
    logger.info("Starting video download...");

    return executeDownload(url, {
        format,
        mergeOutputFormat: "mp4",
    });
}

async function downloadAudio(url) {
    logger.info("Starting audio download...");

    return executeDownload(url, {
        extractAudio: true,
        audioFormat: "mp3",
    });
}

module.exports = {
    getInfo,
    downloadVideo,
    downloadAudio,
};