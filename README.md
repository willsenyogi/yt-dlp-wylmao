# yt-dlp-wylmao

A lightweight Node.js wrapper around `yt-dlp` for downloading YouTube videos with a terminal progress bar, ETA estimation, and structured logging.

## Features

- Fetches video metadata before download
- Downloads video with `yt-dlp`
- Audio-only MP3 download via `--audio`
- Terminal progress bar with speed and ETA
- Suppresses raw `yt-dlp` CLI output
- Logs application events and progress to `logs/system.log`

## Prerequisites

- Node.js 18+ or compatible
- Windows (project currently uses `yt-dlp.exe` in `bin/`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Ensure `bin/yt-dlp.exe` exists and is executable.

## Updating yt-dlp

The project uses the bundled `bin/yt-dlp.exe` binary.

YouTube changes can occasionally cause download errors such as `HTTP Error 403: Forbidden`. Keep the bundled yt-dlp binary up to date by running:

```bash
bin\yt-dlp.exe -U

## Usage

Run the app with a YouTube URL:

```bash
node index.js "https://youtu.be/VIDEO_ID"
```

Download audio only as MP3:

```bash
node index.js --audio "https://youtu.be/VIDEO_ID"
```

Example video download:

```bash
node index.js "https://youtu.be/2GYs--h6FY4?si=7WzbXPVXF9jVFF2P"
```

Example audio-only download:

```bash
node index.js --audio "https://youtu.be/2GYs--h6FY4?si=7WzbXPVXF9jVFF2P"
```

## Output

The app logs both to the console and to `logs/system.log`.

- Console shows startup messages, video metadata, and a live progress bar
- `logs/system.log` records info messages, progress updates, and errors

## Project structure

- `index.js` - application entry point
- `services/ytDlpService.js` - yt-dlp integration and download flow
- `utils/logger.js` - logger that writes to console and `logs/system.log`
- `utils/progress.js` - progress parsing and rendering utilities
- `utils/paths.js` - path configuration for binary and downloads
- `bin/yt-dlp.exe` - bundled yt-dlp binary
- `logs/` - runtime log folder

## Notes

- The service uses `yt-dlp-exec` with `noWarnings` and `noCallHome` enabled to reduce CLI noise.
- Progress parsing is based on yt-dlp download output and formats ETA into a friendly `h m s` style.

