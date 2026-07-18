const path = require("path");
const ytDlp = require("yt-dlp-exec");

const paths = require("../utils/paths");
const logger = require("../utils/logger");
const progress = require("../utils/progress");

async function getInfo(url) {
    return ytDlp(url, {
        dumpJson: true,
    });
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
                if (progressData) {
                    progress.renderProgress(progressData);

                    const now = Date.now();
                    if (now - state.lastLogTime > 5000) {
                        logger.info(`Progress: ${progressData.percentage.toFixed(1)}% | Size: ${progressData.fileSize} | Speed: ${progressData.speed} | ETA: ${progressData.etaFormatted}`);
                        state.lastLogTime = now;
                    }
                } else {
                    logger.debug(`yt-dlp output: ${line}`);
                }
            }
        }

        child.stdout.on("data", (data) => handleData(data, "stdoutBuffer"));
        child.stderr.on("data", (data) => handleData(data, "stderrBuffer"));

        child.on("close", (code) => {
            process.stdout.write("\n");
            if (code === 0) {
                logger.info("Download completed successfully.");
                resolve();
            } else {
                reject(new Error(`yt-dlp exited with code ${code}`));
            }
        });

        child.on("error", (err) => {
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