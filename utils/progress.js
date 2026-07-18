function parseProgressLine(line) {
    const cleaned = line.trim();
    const match = cleaned.match(/^\[download\]\s+([\d.]+)%\s+of\s+~?([^\s]+)\s+at\s+([^\s]+\/s)\s+ETA\s+(\d{1,2}:\d{2}(?::\d{2})?)/);
    if (!match) {
        return null;
    }

    const percentage = parseFloat(match[1]);
    const fileSize = match[2];
    const speed = match[3];
    const etaRaw = match[4];
    const etaSeconds = parseEtaToSeconds(etaRaw);

    return {
        percentage,
        fileSize,
        speed,
        etaRaw,
        etaSeconds,
        etaFormatted: formatEta(etaSeconds),
    };
}

function parseEtaToSeconds(eta) {
    const parts = eta.split(":").map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    return 0;
}

function formatEta(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return "0s";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }
    if (secs > 0 || parts.length === 0) {
        parts.push(`${secs}s`);
    }

    return parts.join(" ");
}

function createProgressBar(percentage, width = 40) {
    const filled = Math.round((percentage / 100) * width);
    const empty = Math.max(width - filled, 0);
    const bar = "█".repeat(filled) + "░".repeat(empty);
    return `[${bar}] ${percentage.toFixed(1)}%`;
}

function renderProgress(progressData) {
    const progressBar = createProgressBar(progressData.percentage);
    const output = `${progressBar} | Speed: ${progressData.speed} | ETA: ${progressData.etaFormatted}`;
    process.stdout.write(`\r${output}   `);
}

module.exports = {
    parseProgressLine,
    parseEtaToSeconds,
    formatEta,
    createProgressBar,
    renderProgress,
};