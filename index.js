const ytDlpService = require("./services/ytDlpService");
const logger = require("./utils/logger");

function printUsage() {
    console.log("\nUsage:");
    console.log("node index.js [--audio|-a] \"<youtube-url>\"");
    console.log("\nOptions:");
    console.log("  --audio, -a   Download audio only as MP3");
    console.log("  --help, -h    Show this help message");
}

async function main() {
    logger.info("Application started.");

    const args = process.argv.slice(2);
    const audioOnly = args.includes("--audio") || args.includes("-a");
    const showHelp = args.includes("--help") || args.includes("-h");
    const url = args.find((arg) => !arg.startsWith("-"));

    if (showHelp || !url) {
        if (!showHelp) {
            logger.error("YouTube URL is required.");
        }

        printUsage();
        process.exit(showHelp ? 0 : 1);
    }

    try {
        logger.info("Fetching video information...");

        const info = await ytDlpService.getInfo(url);

        logger.info(`Title    : ${info.title}`);
        logger.info(`Uploader : ${info.uploader}`);
        logger.info(`Duration : ${info.duration} seconds`);

        if (audioOnly) {
            logger.info("Starting audio download...");
            await ytDlpService.downloadAudio(url);
        } else {
            logger.info("Starting video download...");
            await ytDlpService.downloadVideo(url);
        }

        logger.info("Download completed.");
        logger.info("Application finished.");
    } catch (err) {
        logger.error("An unexpected error occurred.", err);
        process.exit(1);
    }
}

main();