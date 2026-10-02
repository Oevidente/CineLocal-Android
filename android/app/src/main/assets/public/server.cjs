var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express2 = __toESM(require("express"), 1);
var import_fs10 = __toESM(require("fs"), 1);
var import_http = __toESM(require("http"), 1);
var import_https = __toESM(require("https"), 1);
var import_path10 = __toESM(require("path"), 1);

// src/server/routes.ts
var import_express = require("express");
var import_stream = require("stream");
var import_fs9 = __toESM(require("fs"), 1);
var import_os2 = __toESM(require("os"), 1);
var import_path9 = __toESM(require("path"), 1);
var import_child_process3 = require("child_process");

// src/server/storage.ts
var import_fs3 = __toESM(require("fs"), 1);
var import_path3 = __toESM(require("path"), 1);

// src/server/scanner.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_crypto2 = __toESM(require("crypto"), 1);

// src/server/ffmpeg.ts
var import_child_process = require("child_process");
var import_crypto = __toESM(require("crypto"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var cachedFfmpegPath = void 0;
var cachedFfprobePath = void 0;
var cachedHardwareStatus;
function testExecutable(binPath, arg = "-version") {
  try {
    const result = (0, import_child_process.spawnSync)(binPath, [arg], {
      timeout: 3e3,
      windowsHide: true,
      stdio: "ignore"
    });
    return result.status === 0 || result.error === void 0 && result.status !== null;
  } catch {
    return false;
  }
}
function getBinaries() {
  if (cachedFfmpegPath !== void 0 && cachedFfprobePath !== void 0) {
    return { ffmpeg: cachedFfmpegPath, ffprobe: cachedFfprobePath };
  }
  const isWindows = process.platform === "win32";
  const rootDir = process.cwd();
  const ffmpegCandidates = [];
  if (process.env.FFMPEG_PATH) ffmpegCandidates.push(process.env.FFMPEG_PATH);
  ffmpegCandidates.push(
    import_path.default.join(rootDir, "bin", isWindows ? "ffmpeg.exe" : "ffmpeg"),
    import_path.default.join(rootDir, "ffmpeg", "bin", isWindows ? "ffmpeg.exe" : "ffmpeg"),
    import_path.default.join(rootDir, "ffmpeg", isWindows ? "ffmpeg.exe" : "ffmpeg"),
    import_path.default.join(rootDir, isWindows ? "ffmpeg.exe" : "ffmpeg")
  );
  if (isWindows) {
    const localAppData = process.env.LOCALAPPDATA || "";
    const userProfile = process.env.USERPROFILE || "";
    const programData = process.env.ProgramData || "C:\\ProgramData";
    const programFiles = process.env.ProgramFiles || "C:\\Program Files";
    const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    if (localAppData) {
      ffmpegCandidates.push(import_path.default.join(localAppData, "Microsoft", "WinGet", "Links", "ffmpeg.exe"));
      try {
        const wingetPkgs = import_path.default.join(localAppData, "Microsoft", "WinGet", "Packages");
        if (import_fs.default.existsSync(wingetPkgs)) {
          const dirs = import_fs.default.readdirSync(wingetPkgs);
          for (const d of dirs) {
            if (d.toLowerCase().includes("ffmpeg")) {
              const fullPkgDir = import_path.default.join(wingetPkgs, d);
              const subItems = import_fs.default.readdirSync(fullPkgDir);
              for (const sub of subItems) {
                ffmpegCandidates.push(import_path.default.join(fullPkgDir, sub, "bin", "ffmpeg.exe"));
                ffmpegCandidates.push(import_path.default.join(fullPkgDir, sub, "ffmpeg.exe"));
              }
            }
          }
        }
      } catch {
      }
    }
    if (userProfile) {
      ffmpegCandidates.push(import_path.default.join(userProfile, "scoop", "shims", "ffmpeg.exe"));
      ffmpegCandidates.push(import_path.default.join(userProfile, "scoop", "apps", "ffmpeg", "current", "bin", "ffmpeg.exe"));
    }
    ffmpegCandidates.push(
      import_path.default.join(programData, "chocolatey", "bin", "ffmpeg.exe"),
      import_path.default.join(programData, "chocolatey", "lib", "ffmpeg", "tools", "ffmpeg", "bin", "ffmpeg.exe")
    );
    ffmpegCandidates.push(
      "C:\\ffmpeg\\bin\\ffmpeg.exe",
      "C:\\ffmpeg\\ffmpeg.exe",
      import_path.default.join(programFiles, "ffmpeg", "bin", "ffmpeg.exe"),
      import_path.default.join(programFilesX86, "ffmpeg", "bin", "ffmpeg.exe")
    );
  }
  const ffprobeCandidates = [];
  if (process.env.FFPROBE_PATH) ffprobeCandidates.push(process.env.FFPROBE_PATH);
  ffprobeCandidates.push(
    import_path.default.join(rootDir, "bin", isWindows ? "ffprobe.exe" : "ffprobe"),
    import_path.default.join(rootDir, "ffmpeg", "bin", isWindows ? "ffprobe.exe" : "ffprobe"),
    import_path.default.join(rootDir, "ffmpeg", isWindows ? "ffprobe.exe" : "ffprobe"),
    import_path.default.join(rootDir, isWindows ? "ffprobe.exe" : "ffprobe")
  );
  if (isWindows) {
    const localAppData = process.env.LOCALAPPDATA || "";
    const userProfile = process.env.USERPROFILE || "";
    const programData = process.env.ProgramData || "C:\\ProgramData";
    const programFiles = process.env.ProgramFiles || "C:\\Program Files";
    const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    if (localAppData) {
      ffprobeCandidates.push(import_path.default.join(localAppData, "Microsoft", "WinGet", "Links", "ffprobe.exe"));
    }
    if (userProfile) {
      ffprobeCandidates.push(import_path.default.join(userProfile, "scoop", "shims", "ffprobe.exe"));
      ffprobeCandidates.push(import_path.default.join(userProfile, "scoop", "apps", "ffmpeg", "current", "bin", "ffprobe.exe"));
    }
    ffprobeCandidates.push(
      import_path.default.join(programData, "chocolatey", "bin", "ffprobe.exe"),
      import_path.default.join(programData, "chocolatey", "lib", "ffmpeg", "tools", "ffmpeg", "bin", "ffprobe.exe")
    );
    ffprobeCandidates.push(
      "C:\\ffmpeg\\bin\\ffprobe.exe",
      "C:\\ffmpeg\\ffprobe.exe",
      import_path.default.join(programFiles, "ffmpeg", "bin", "ffprobe.exe"),
      import_path.default.join(programFilesX86, "ffmpeg", "bin", "ffprobe.exe")
    );
  }
  let resolvedFfmpeg = null;
  for (const cand of ffmpegCandidates) {
    try {
      if (cand && import_fs.default.existsSync(cand) && import_fs.default.statSync(cand).isFile()) {
        resolvedFfmpeg = import_path.default.resolve(cand);
        break;
      }
    } catch {
    }
  }
  if (!resolvedFfmpeg) {
    if (testExecutable("ffmpeg")) {
      resolvedFfmpeg = "ffmpeg";
    }
  }
  let resolvedFfprobe = null;
  for (const cand of ffprobeCandidates) {
    try {
      if (cand && import_fs.default.existsSync(cand) && import_fs.default.statSync(cand).isFile()) {
        resolvedFfprobe = import_path.default.resolve(cand);
        break;
      }
    } catch {
    }
  }
  if (!resolvedFfprobe) {
    if (testExecutable("ffprobe")) {
      resolvedFfprobe = "ffprobe";
    }
  }
  cachedFfmpegPath = resolvedFfmpeg;
  cachedFfprobePath = resolvedFfprobe;
  return { ffmpeg: resolvedFfmpeg, ffprobe: resolvedFfprobe };
}
function readAvailableVideoEncoders(ffmpeg) {
  try {
    const result = (0, import_child_process.spawnSync)(ffmpeg, ["-hide_banner", "-encoders"], {
      timeout: 5e3,
      windowsHide: true,
      encoding: "utf8"
    });
    const output = `${result.stdout || ""}
${result.stderr || ""}`;
    return ["h264_nvenc", "h264_qsv", "h264_amf", "h264_vaapi"].filter((encoder) => output.includes(encoder));
  } catch {
    return [];
  }
}
var runtimeHwMode;
var runtimeHwEncoder;
function setHardwareAccelerationConfig(config) {
  if (config.mode !== void 0) runtimeHwMode = config.mode;
  if (config.encoder !== void 0) runtimeHwEncoder = config.encoder || void 0;
  cachedHardwareStatus = void 0;
}
function getHardwareAccelerationStatus() {
  if (cachedHardwareStatus) return cachedHardwareStatus;
  const envMode = process.env.FFMPEG_HW_ACCELERATION?.trim().toLowerCase();
  const rawMode = runtimeHwMode || (envMode === "off" || envMode === "software" ? envMode : "auto");
  const mode = rawMode === "off" || rawMode === "software" ? rawMode : "auto";
  const { ffmpeg } = getBinaries();
  const availableEncoders = ffmpeg ? readAvailableVideoEncoders(ffmpeg) : [];
  const requestedEncoder = runtimeHwEncoder || process.env.FFMPEG_VIDEO_ENCODER?.trim().toLowerCase();
  const preferredOrder = requestedEncoder ? [requestedEncoder] : ["h264_nvenc", "h264_qsv", "h264_amf", "h264_vaapi"];
  const encoder = mode === "auto" ? preferredOrder.find((candidate) => availableEncoders.includes(candidate)) : void 0;
  cachedHardwareStatus = { mode, encoder, availableEncoders };
  return cachedHardwareStatus;
}
function getVideoEncodingPlan(preferHardware = true) {
  const status = getHardwareAccelerationStatus();
  const encoder = preferHardware && status.mode === "auto" ? status.encoder : void 0;
  if (encoder === "h264_nvenc") {
    return {
      inputArgs: ["-hwaccel", "auto"],
      outputArgs: ["-c:v", "h264_nvenc", "-preset", "p4", "-rc", "vbr", "-cq", "23", "-b:v", "0", "-profile:v", "main", "-pix_fmt", "yuv420p"],
      encoder,
      hardware: true
    };
  }
  if (encoder === "h264_qsv") {
    return {
      inputArgs: ["-hwaccel", "auto"],
      outputArgs: ["-c:v", "h264_qsv", "-preset", "veryfast", "-global_quality", "23", "-profile:v", "main", "-pix_fmt", "yuv420p"],
      encoder,
      hardware: true
    };
  }
  if (encoder === "h264_amf") {
    return {
      inputArgs: ["-hwaccel", "auto"],
      outputArgs: ["-c:v", "h264_amf", "-quality", "speed", "-rc", "cqp", "-qp_i", "23", "-qp_p", "23", "-profile:v", "main", "-pix_fmt", "yuv420p"],
      encoder,
      hardware: true
    };
  }
  if (encoder === "h264_vaapi") {
    return {
      inputArgs: [],
      outputArgs: ["-c:v", "h264_vaapi", "-qp", "23", "-profile:v", "main"],
      encoder,
      hardware: true
    };
  }
  return {
    inputArgs: [],
    outputArgs: [
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-tune",
      "zerolatency",
      "-profile:v",
      "baseline",
      "-level",
      "3.1",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-g",
      "30",
      "-keyint_min",
      "30"
    ],
    encoder: "libx264",
    hardware: false
  };
}
async function downloadAndInstallFFmpeg() {
  const rootDir = process.cwd();
  const binDir = import_path.default.join(rootDir, "bin");
  if (!import_fs.default.existsSync(binDir)) {
    import_fs.default.mkdirSync(binDir, { recursive: true });
  }
  const isWindows = process.platform === "win32";
  if (isWindows) {
    const psScript = `
$ProgressPreference = 'SilentlyContinue';
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;
$binDir = '${binDir.replace(/\\/g, "\\\\")}';
$zipUrl = 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip';
$zipPath = Join-Path $env:TEMP 'cinelocal_ffmpeg.zip';
$extractDir = Join-Path $env:TEMP 'cinelocal_ffmpeg_extract';

if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue };
if (Test-Path $zipPath) { Remove-Item $zipPath -Force -ErrorAction SilentlyContinue };

Write-Output 'DOWNLOADING';
try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing -TimeoutSec 180;
} catch {
    # Fallback to Gyan essentials
    $zipUrl = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing -TimeoutSec 180;
}

Write-Output 'EXTRACTING';
Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force;

$ffmpegExe = Get-ChildItem -Path $extractDir -Filter 'ffmpeg.exe' -Recurse | Select-Object -First 1;
$ffprobeExe = Get-ChildItem -Path $extractDir -Filter 'ffprobe.exe' -Recurse | Select-Object -First 1;

if ($ffmpegExe) {
    Copy-Item $ffmpegExe.FullName -Destination (Join-Path $binDir 'ffmpeg.exe') -Force;
}
if ($ffprobeExe) {
    Copy-Item $ffprobeExe.FullName -Destination (Join-Path $binDir 'ffprobe.exe') -Force;
}

Remove-Item $zipPath -Force -ErrorAction SilentlyContinue;
Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue;
Write-Output 'DONE';
`;
    return new Promise((resolve) => {
      (0, import_child_process.execFile)(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", psScript],
        { timeout: 3e5 },
        (err, stdout, stderr) => {
          invalidateBinariesCache();
          const bins2 = getBinaries();
          if (bins2.ffmpeg) {
            resolve({
              success: true,
              message: "FFmpeg instalado com sucesso na pasta bin do CineLocal!",
              binaries: bins2
            });
          } else {
            resolve({
              success: false,
              message: `Falha ao baixar FFmpeg: ${err?.message || stderr || stdout || "Erro desconhecido"}`,
              binaries: bins2
            });
          }
        }
      );
    });
  }
  invalidateBinariesCache();
  const bins = getBinaries();
  return {
    success: !!bins.ffmpeg,
    message: bins.ffmpeg ? "FFmpeg detectado no sistema." : "No Linux ou macOS, instale o ffmpeg via terminal (ex: sudo apt install ffmpeg ou brew install ffmpeg).",
    binaries: bins
  };
}
function invalidateBinariesCache() {
  cachedFfmpegPath = void 0;
  cachedFfprobePath = void 0;
  cachedHardwareStatus = void 0;
}
function parseDurationString(val) {
  if (!val) return 0;
  if (typeof val === "number") return Math.floor(val);
  const str = String(val).trim();
  if (!str || str === "N/A") return 0;
  if (str.includes(":")) {
    const parts = str.split(":");
    if (parts.length === 3) {
      const hours = parseFloat(parts[0]) || 0;
      const minutes = parseFloat(parts[1]) || 0;
      const seconds = parseFloat(parts[2]) || 0;
      return Math.floor(hours * 3600 + minutes * 60 + seconds);
    }
    if (parts.length === 2) {
      const minutes = parseFloat(parts[0]) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      return Math.floor(minutes * 60 + seconds);
    }
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : Math.floor(parsed);
}
async function probeMedia(filePath) {
  const { ffprobe } = getBinaries();
  const fallbackData = {
    durationSeconds: 0,
    videoCodec: void 0,
    resolution: void 0,
    audioTracks: [],
    subtitleTracks: []
  };
  if (!ffprobe || !import_fs.default.existsSync(filePath)) {
    return fallbackData;
  }
  return new Promise((resolve) => {
    const args = [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath
    ];
    (0, import_child_process.execFile)(ffprobe, args, { timeout: 15e3 }, (err, stdout) => {
      if (err || !stdout) {
        return resolve(fallbackData);
      }
      try {
        const data = JSON.parse(stdout);
        const format = data.format || {};
        const streams = Array.isArray(data.streams) ? data.streams : [];
        let durationSeconds = parseDurationString(format.duration);
        if (!durationSeconds && format.tags) {
          durationSeconds = parseDurationString(
            format.tags.DURATION || format.tags.duration || format.tags["DURATION-por"] || format.tags["DURATION-eng"]
          );
        }
        let videoCodec;
        let pixFmt;
        let resolution;
        const audioTracks = [];
        const subtitleTracks = [];
        let audioCounter = 0;
        let subCounter = 0;
        for (const stream of streams) {
          if (stream.codec_type === "video" && !videoCodec) {
            videoCodec = stream.codec_name;
            pixFmt = stream.pix_fmt;
            if (stream.width && stream.height) {
              resolution = `${stream.width}x${stream.height}`;
            }
            if (!durationSeconds && stream.duration) {
              durationSeconds = parseDurationString(stream.duration);
            }
            if (!durationSeconds && stream.tags) {
              durationSeconds = parseDurationString(
                stream.tags.DURATION || stream.tags.duration || stream.tags["DURATION-por"] || stream.tags["DURATION-eng"]
              );
            }
          } else if (stream.codec_type === "audio") {
            const tags = stream.tags || {};
            const lang = tags.language || tags.LANGUAGE || "und";
            const title = tags.title || tags.handler_name || `Faixa ${audioCounter + 1}`;
            if (!durationSeconds && stream.duration) {
              durationSeconds = parseDurationString(stream.duration);
            }
            if (!durationSeconds && tags) {
              durationSeconds = parseDurationString(
                tags.DURATION || tags.duration || tags["DURATION-por"] || tags["DURATION-eng"]
              );
            }
            audioTracks.push({
              index: audioCounter++,
              streamIndex: stream.index,
              codec: stream.codec_name || "unknown",
              language: lang,
              title: `${title} (${lang.toUpperCase()})`,
              channels: stream.channels || 2
            });
          } else if (stream.codec_type === "subtitle") {
            const tags = stream.tags || {};
            const lang = tags.language || tags.LANGUAGE || "und";
            const title = tags.title || tags.handler_name || `Legenda ${subCounter + 1}`;
            subtitleTracks.push({
              index: subCounter++,
              streamIndex: stream.index,
              codec: stream.codec_name || "unknown",
              language: lang,
              title: `${title} (${lang.toUpperCase()})`,
              isExternal: false
            });
          }
        }
        resolve({
          durationSeconds,
          videoCodec,
          pixFmt,
          resolution,
          audioTracks,
          subtitleTracks
        });
      } catch (parseErr) {
        console.error("Error parsing ffprobe output:", parseErr);
        resolve(fallbackData);
      }
    });
  });
}
async function extractEmbeddedCover(filePath) {
  const { ffmpeg } = getBinaries();
  if (!ffmpeg || !import_fs.default.existsSync(filePath)) return null;
  const hash = Buffer.from(filePath).toString("base64url").slice(0, 32);
  const outPath = import_path.default.join(getThumbnailDir(), `cover_${hash}.jpg`);
  if (import_fs.default.existsSync(outPath) && import_fs.default.statSync(outPath).size > 1500) {
    return outPath;
  }
  return new Promise((resolve) => {
    const args = [
      "-i",
      filePath,
      "-map",
      "0:v",
      "-map",
      "-0:V",
      "-c",
      "copy",
      "-y",
      outPath
    ];
    (0, import_child_process.execFile)(ffmpeg, args, { timeout: 8e3 }, (err) => {
      if (!err && import_fs.default.existsSync(outPath) && import_fs.default.statSync(outPath).size > 1500) {
        resolve(outPath);
      } else {
        if (import_fs.default.existsSync(outPath) && import_fs.default.statSync(outPath).size <= 1500) {
          try {
            import_fs.default.unlinkSync(outPath);
          } catch {
          }
        }
        resolve(null);
      }
    });
  });
}
async function generateThumbnail(filePath, timeSec = 10, aspectRatio = "landscape") {
  const { ffmpeg } = getBinaries();
  if (!ffmpeg || !import_fs.default.existsSync(filePath)) return null;
  const prefix = aspectRatio === "poster" ? "poster_thumb" : "thumb";
  const hash = Buffer.from(filePath).toString("base64url").slice(0, 32);
  const outPath = import_path.default.join(getThumbnailDir(), `${prefix}_${hash}.jpg`);
  if (import_fs.default.existsSync(outPath) && import_fs.default.statSync(outPath).size > 1e3) {
    return outPath;
  }
  const vfFilter = aspectRatio === "poster" ? "scale=480:720:force_original_aspect_ratio=increase,crop=480:720" : "scale=640:-1";
  return new Promise((resolve) => {
    const args = [
      "-ss",
      Math.max(1, timeSec).toString(),
      "-i",
      filePath,
      "-vframes",
      "1",
      "-q:v",
      "3",
      "-vf",
      vfFilter,
      "-y",
      outPath
    ];
    (0, import_child_process.execFile)(ffmpeg, args, { timeout: 1e4 }, (err) => {
      if (err || !import_fs.default.existsSync(outPath)) {
        resolve(null);
      } else {
        resolve(outPath);
      }
    });
  });
}
function isBrowserNativeDirectPlayable(filePath, videoCodec, audioCodec, pixFmt) {
  const ext = import_path.default.extname(filePath).toLowerCase();
  if (ext === ".mp4" || ext === ".m4v" || ext === ".webm") {
    const vc = (videoCodec || "").toLowerCase();
    const ac = (audioCodec || "").toLowerCase();
    const pf = (pixFmt || "").toLowerCase();
    const isVGood = !vc || vc === "h264" || vc === "vp8" || vc === "vp9" || vc === "av1";
    const isAGood = !ac || ac === "aac" || ac === "mp3" || ac === "opus" || ac === "vorbis";
    const isPixGood = !pf || pf === "yuv420p";
    return isVGood && isAGood && isPixGood;
  }
  return false;
}
function parseWebVttTimestamp(value) {
  const parts = value.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(parts[0]) || 0;
}
function formatWebVttTimestamp(totalSeconds) {
  const safeMs = Math.max(0, Math.round(totalSeconds * 1e3));
  const ms = safeMs % 1e3;
  const totalSec = Math.floor(safeMs / 1e3);
  const seconds = totalSec % 60;
  const minutes = Math.floor(totalSec / 60) % 60;
  const hours = Math.floor(totalSec / 3600);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}
function shiftWebVttTimestamps(content, offsetSeconds) {
  const safeOffset = Number.isFinite(offsetSeconds) ? offsetSeconds : 0;
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trimEnd();
  if (!normalized) return "WEBVTT\n\n";
  const blocks = normalized.split(/\n{2,}/);
  const validBlocks = [];
  const timingRegex = /^(\s*)(\d{1,3}:\d{2}(?::\d{2})?[\.,]\d{3})\s+-->\s+(\d{1,3}:\d{2}(?::\d{2})?[\.,]\d{3})(.*)$/;
  for (const block of blocks) {
    const lines = block.split("\n");
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex < 0) {
      validBlocks.push(block);
      continue;
    }
    const match = lines[timingIndex].match(timingRegex);
    if (!match) {
      validBlocks.push(block);
      continue;
    }
    const start = parseWebVttTimestamp(match[2].replace(",", ".")) + safeOffset;
    const end = parseWebVttTimestamp(match[3].replace(",", ".")) + safeOffset;
    const clampedStart = Math.max(0, start);
    const clampedEnd = Math.max(0, end);
    if (clampedEnd <= 0 || clampedEnd <= clampedStart) continue;
    lines[timingIndex] = `${match[1]}${formatWebVttTimestamp(clampedStart)} --> ${formatWebVttTimestamp(clampedEnd)}${match[4] || ""}`;
    validBlocks.push(lines.join("\n"));
  }
  const header = validBlocks[0]?.trimStart().toUpperCase().startsWith("WEBVTT") ? validBlocks.shift() : "WEBVTT";
  return `${[header, ...validBlocks].filter(Boolean).join("\n\n")}

`;
}
function isBitmapSubtitleCodec(codec) {
  return /pgs|dvd[_-]?subtitle|dvb[_-]?subtitle|vobsub|xsub|teletext/i.test(codec || "");
}
function getSubtitleCachePath(filePath, streamIndex, offsetSeconds) {
  const stat = import_fs.default.statSync(filePath);
  const key = import_crypto.default.createHash("sha1").update(`${import_path.default.resolve(filePath)}:${stat.size}:${stat.mtimeMs}:${streamIndex}:${offsetSeconds.toFixed(3)}`).digest("hex");
  return import_path.default.join(process.cwd(), ".cache", "subtitles", `${key}.vtt`);
}
function writeSubtitleCache(cachePath, content) {
  try {
    import_fs.default.mkdirSync(import_path.default.dirname(cachePath), { recursive: true });
    const tempPath = `${cachePath}.${process.pid}.${Date.now()}.tmp`;
    import_fs.default.writeFileSync(tempPath, content, "utf8");
    import_fs.default.renameSync(tempPath, cachePath);
  } catch (error) {
    console.warn("[Subtitles] N\xE3o foi poss\xEDvel gravar cache WebVTT:", error instanceof Error ? error.message : error);
  }
}
function streamSubtitlesToVtt(filePath, streamIndex, res, offsetSeconds = 0) {
  const { ffmpeg } = getBinaries();
  if (!ffmpeg || !import_fs.default.existsSync(filePath)) {
    res.status(404).send("Arquivo de v\xEDdeo ou ffmpeg n\xE3o encontrado");
    return;
  }
  const cachePath = getSubtitleCachePath(filePath, streamIndex, Number.isFinite(offsetSeconds) ? offsetSeconds : 0);
  if (import_fs.default.existsSync(cachePath) && import_fs.default.statSync(cachePath).size > 0) {
    res.setHeader("Content-Type", "text/vtt; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.sendFile(cachePath);
    return;
  }
  res.setHeader("Content-Type", "text/vtt; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  const args = [
    "-i",
    filePath,
    "-map",
    `0:${streamIndex}`,
    "-f",
    "webvtt",
    "pipe:1"
  ];
  const proc = (0, import_child_process.spawn)(ffmpeg, args);
  const chunks = [];
  proc.stdout.on("data", (chunk) => {
    const buffer = Buffer.from(chunk);
    chunks.push(buffer);
    if (offsetSeconds === 0 && !res.writableEnded) res.write(buffer);
  });
  proc.stdout.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8");
    const output = shiftWebVttTimestamps(raw, offsetSeconds);
    writeSubtitleCache(cachePath, output);
    if (offsetSeconds !== 0 && !res.writableEnded) {
      res.end(output);
    } else if (!res.writableEnded) {
      res.end();
    }
  });
  proc.stderr.on("data", () => {
  });
  proc.on("error", (err) => {
    console.error("Subtitle extraction error:", err);
    if (!res.headersSent) {
      res.status(500).send("Erro ao extrair legenda");
    }
  });
  res.on("close", () => {
    try {
      proc.kill("SIGKILL");
    } catch {
    }
  });
}

// src/server/scanner.ts
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([".mp4", ".mkv", ".avi", ".webm", ".mov", ".m4v", ".ts", ".flv", ".wmv"]);
var SUBTITLE_EXTENSIONS = /* @__PURE__ */ new Set([".srt", ".vtt", ".ass", ".ssa"]);
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".webp"]);
var POSTER_NAMES = [
  "poster.jpg",
  "poster.jpeg",
  "poster.png",
  "poster.webp",
  "folder.jpg",
  "folder.jpeg",
  "folder.png",
  "folder.webp",
  "cover.jpg",
  "cover.jpeg",
  "cover.png",
  "cover.webp",
  "capa.jpg",
  "capa.jpeg",
  "capa.png",
  "capa.webp",
  "cartaz.jpg",
  "cartaz.jpeg",
  "cartaz.png",
  "cartaz.webp"
];
var BACKDROP_NAMES = [
  "backdrop.jpg",
  "backdrop.jpeg",
  "backdrop.png",
  "backdrop.webp",
  "fanart.jpg",
  "fanart.jpeg",
  "fanart.png",
  "fanart.webp",
  "banner.jpg",
  "banner.jpeg",
  "banner.png",
  "banner.webp",
  "fundo.jpg",
  "fundo.jpeg",
  "fundo.png",
  "fundo.webp"
];
function parseEpisodeInfo(fileNameOrPath, fallbackIndex) {
  const normalizedPath = fileNameOrPath.replace(/\\/g, "/");
  const pathParts = normalizedPath.split("/").filter(Boolean);
  const fileName = pathParts[pathParts.length - 1] || fileNameOrPath;
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  let pathSeason;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    const sMatch = part.match(/(?:temporada|season|s)\s*(\d{1,2})/i);
    if (sMatch) {
      const parsedS = parseInt(sMatch[1], 10);
      if (parsedS > 0 && parsedS < 100) {
        pathSeason = parsedS;
      }
    }
  }
  const sxxExxMatch = nameWithoutExt.match(/[Ss](\d{1,2})[\.\s_-]*[Ee](\d{1,3})/);
  if (sxxExxMatch) {
    const season = parseInt(sxxExxMatch[1], 10);
    const episode = parseInt(sxxExxMatch[2], 10);
    const title = cleanEpisodeTitle(nameWithoutExt, sxxExxMatch[0]);
    return {
      seasonNumber: season || pathSeason || 1,
      episodeNumber: episode,
      cleanTitle: title || `Epis\xF3dio ${episode}`
    };
  }
  const xMatch = nameWithoutExt.match(/(?:^|[\s._\-\[])(\d{1,2})[xX](\d{1,3})/);
  if (xMatch) {
    const season = parseInt(xMatch[1], 10);
    const episode = parseInt(xMatch[2], 10);
    const title = cleanEpisodeTitle(nameWithoutExt, xMatch[0]);
    return {
      seasonNumber: season || pathSeason || 1,
      episodeNumber: episode,
      cleanTitle: title || `Epis\xF3dio ${episode}`
    };
  }
  const seasonEpisodeMatch = nameWithoutExt.match(/(?:temporada|season)\s*(\d{1,2})[\s\S]*?(?:episodio|episódio|ep|episode)\s*(\d{1,3})/i);
  if (seasonEpisodeMatch) {
    const season = parseInt(seasonEpisodeMatch[1], 10);
    const episode = parseInt(seasonEpisodeMatch[2], 10);
    const title = cleanEpisodeTitle(nameWithoutExt, seasonEpisodeMatch[0]);
    return {
      seasonNumber: season || pathSeason || 1,
      episodeNumber: episode,
      cleanTitle: title || `Epis\xF3dio ${episode}`
    };
  }
  const epOnlyMatch = nameWithoutExt.match(/(?:^|[\s._\-\[])(?:[Ee][Pp]?|episodio|episódio)\s*[-_.]?\s*(\d{1,3})/i);
  if (epOnlyMatch) {
    const episode = parseInt(epOnlyMatch[1], 10);
    const title = cleanEpisodeTitle(nameWithoutExt, epOnlyMatch[0]);
    return {
      seasonNumber: pathSeason || 1,
      episodeNumber: episode,
      cleanTitle: title || `Epis\xF3dio ${episode}`
    };
  }
  const animeMatch = nameWithoutExt.match(/(?:^|[\s._\-\]])-\s*(\d{1,3})(?:[\s._\-\[]|$)/);
  if (animeMatch) {
    const episode = parseInt(animeMatch[1], 10);
    const title = cleanEpisodeTitle(nameWithoutExt, animeMatch[0]);
    return {
      seasonNumber: pathSeason || 1,
      episodeNumber: episode,
      cleanTitle: title || `Epis\xF3dio ${episode}`
    };
  }
  const leadingNumMatch = nameWithoutExt.match(/^(\d{1,3})[\s\.\-_]*(.*)/);
  if (leadingNumMatch) {
    const episode = parseInt(leadingNumMatch[1], 10);
    const title = cleanEpisodeTitle(leadingNumMatch[2], "");
    return {
      seasonNumber: pathSeason || 1,
      episodeNumber: episode,
      cleanTitle: title || `Epis\xF3dio ${episode}`
    };
  }
  return {
    seasonNumber: pathSeason || 1,
    episodeNumber: fallbackIndex,
    cleanTitle: cleanEpisodeTitle(nameWithoutExt, "") || `V\xEDdeo ${fallbackIndex}`
  };
}
function cleanEpisodeTitle(rawName, matchedToken) {
  let cleaned = rawName;
  if (matchedToken) {
    const idx = cleaned.indexOf(matchedToken);
    if (idx >= 0) {
      cleaned = cleaned.substring(idx + matchedToken.length);
    }
  }
  cleaned = cleaned.replace(/[\[\(].*?[\]\)]/g, " ").replace(/\b(?:2160p|1080p|720p|480p|4k|bluray|brrip|webrip|web-dl|webdl|hdtv|x264|x265|hevc|avc|aac|dts|ddp|ac3|yify|yts|eztv|tgx|rarbg|galaxytv|dual|dublado|legendado|multi|ita|eng|por)\b/gi, " ").replace(/[\._]/g, " ").replace(/^[-\s.:]+|[-\s.:]+$/g, "").trim();
  return cleaned;
}
function getAllFiles(dirPath, maxDepth = 4, currentDepth = 0) {
  let results = [];
  if (currentDepth > maxDepth || !import_fs2.default.existsSync(dirPath)) return results;
  try {
    const list = import_fs2.default.readdirSync(dirPath, { withFileTypes: true });
    for (const item of list) {
      const fullPath = import_path2.default.join(dirPath, item.name);
      if (item.isDirectory()) {
        results = results.concat(getAllFiles(fullPath, maxDepth, currentDepth + 1));
      } else {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
  }
  return results;
}
function findExternalSubtitles(videoPath, allFiles) {
  const dir = import_path2.default.dirname(videoPath);
  const baseName = import_path2.default.basename(videoPath, import_path2.default.extname(videoPath));
  const subTracks = [];
  for (const file of allFiles) {
    if (import_path2.default.dirname(file) !== dir) continue;
    const ext = import_path2.default.extname(file).toLowerCase();
    if (!SUBTITLE_EXTENSIONS.has(ext)) continue;
    const subBase = import_path2.default.basename(file, ext);
    if (subBase.startsWith(baseName) || allFiles.length < 5) {
      const langSuffix = subBase.replace(baseName, "").replace(/^[\.\-_]/, "");
      const lang = langSuffix || "pt";
      const label = langSuffix ? `Legenda Externa (${langSuffix})` : "Legenda Externa";
      subTracks.push({
        index: 100 + subTracks.length,
        streamIndex: -1,
        codec: ext.replace(".", ""),
        language: lang,
        title: label,
        isExternal: true,
        filePath: file
      });
    }
  }
  return subTracks;
}
var AUXILIARY_VIDEO_REGEX = /(^|[\._\-\s])(vinheta|intro|abertura|sample|trailer|teaser|preview|featurette|extra|bonus)([\._\-\s]|$)/i;
function detectMediaKind(videoFiles, folderPath) {
  if (videoFiles.length > 1) {
    return "series";
  }
  if (videoFiles.length === 1) {
    const vFile = videoFiles[0];
    const fileName = import_path2.default.basename(vFile);
    const relPath = import_path2.default.relative(folderPath, vFile).replace(/\\/g, "/");
    const hasSxxExx = /[Ss]\d{1,2}[\.\s_-]*[Ee]\d{1,3}/i.test(fileName);
    const hasNxNN = /(?:^|[\s._\-\[])\d{1,2}[xX]\d{1,3}/i.test(fileName);
    const hasSeasonWord = /(?:temporada|season)\s*\d+/i.test(relPath);
    const hasEpisodeWord = /(?:episodio|episódio|ep|episode)\s*[-_.]?\s*\d+/i.test(fileName);
    const hasAnimeDash = /(?:^|[\s._\-\]])-\s*\d{1,3}(?:[\s._\-\[]|$)/.test(fileName);
    if (hasSxxExx || hasNxNN || hasSeasonWord || hasEpisodeWord || hasAnimeDash) {
      return "series";
    }
  }
  return "movie";
}
async function scanMediaFolder(folderPath, customTitle) {
  const resolvedPath = import_path2.default.resolve(folderPath);
  if (!import_fs2.default.existsSync(resolvedPath)) {
    throw new Error(`Pasta n\xE3o encontrada: ${resolvedPath}`);
  }
  const allFiles = getAllFiles(resolvedPath);
  const allVideoFiles = allFiles.filter((f) => VIDEO_EXTENSIONS.has(import_path2.default.extname(f).toLowerCase()));
  if (allVideoFiles.length === 0) {
    throw new Error(`Nenhum arquivo de v\xEDdeo suportado (.mp4, .mkv, .avi, .webm) encontrado em ${resolvedPath}`);
  }
  let videoFiles = allVideoFiles.filter((f) => !AUXILIARY_VIDEO_REGEX.test(import_path2.default.basename(f)));
  if (videoFiles.length === 0) {
    videoFiles = allVideoFiles;
  }
  const seenPaths = /* @__PURE__ */ new Set();
  videoFiles = videoFiles.filter((f) => {
    const normalized = import_path2.default.resolve(f);
    if (seenPaths.has(normalized)) return false;
    seenPaths.add(normalized);
    return true;
  });
  let posterPath;
  let backdropPath;
  for (const file of allFiles) {
    const lowerName = import_path2.default.basename(file).toLowerCase();
    if (!posterPath && POSTER_NAMES.includes(lowerName)) {
      posterPath = file;
    }
    if (!backdropPath && BACKDROP_NAMES.includes(lowerName)) {
      backdropPath = file;
    }
  }
  if (!posterPath) {
    for (const vFile of videoFiles) {
      const vBase = import_path2.default.basename(vFile, import_path2.default.extname(vFile)).toLowerCase();
      const matchedImage = allFiles.find((f) => {
        const ext = import_path2.default.extname(f).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(ext)) return false;
        const imgBase = import_path2.default.basename(f, ext).toLowerCase();
        return imgBase === vBase || imgBase === `${vBase}-poster` || imgBase === `${vBase}-cover` || imgBase === `${vBase}-capa` || imgBase === `${vBase}.poster` || imgBase === `${vBase}.cover`;
      });
      if (matchedImage) {
        posterPath = matchedImage;
        break;
      }
    }
  }
  if (!posterPath && videoFiles[0]) {
    try {
      const embedded = await extractEmbeddedCover(videoFiles[0]);
      if (embedded) {
        posterPath = embedded;
      }
    } catch {
    }
  }
  const folderName = import_path2.default.basename(resolvedPath);
  const title = customTitle?.trim() || folderName.replace(/[\._]/g, " ").trim();
  const kind = detectMediaKind(videoFiles, resolvedPath);
  videoFiles.sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
  const rawEpisodes = [];
  let epCounter = 1;
  for (const vFile of videoFiles) {
    const fileName = import_path2.default.basename(vFile);
    const stats = import_fs2.default.statSync(vFile);
    const relPath = import_path2.default.relative(resolvedPath, vFile);
    const parsed = parseEpisodeInfo(relPath || fileName, epCounter++);
    const probe = await probeMedia(vFile);
    const externalSubs = findExternalSubtitles(vFile, allFiles);
    const allSubs = [...probe.subtitleTracks, ...externalSubs];
    const epHash = import_crypto2.default.createHash("md5").update(vFile).digest("hex").slice(0, 12);
    const epId = `ep_s${parsed.seasonNumber}e${parsed.episodeNumber}_${epHash}`;
    const episode = {
      id: epId,
      seasonNumber: parsed.seasonNumber,
      episodeNumber: parsed.episodeNumber,
      title: parsed.cleanTitle,
      fileName,
      filePath: vFile,
      extension: import_path2.default.extname(vFile).toLowerCase(),
      sizeBytes: stats.size,
      durationSeconds: probe.durationSeconds || 0,
      videoCodec: probe.videoCodec,
      pixFmt: probe.pixFmt,
      resolution: probe.resolution,
      audioTracks: probe.audioTracks,
      subtitleTracks: allSubs,
      watched: false,
      progressSeconds: 0
    };
    rawEpisodes.push({ ep: episode, seasonNum: parsed.seasonNumber, rawEpNum: parsed.episodeNumber });
  }
  if (kind === "movie") {
    const singleEp = rawEpisodes[0]?.ep;
    if (singleEp) {
      singleEp.seasonNumber = 0;
      singleEp.episodeNumber = 1;
      singleEp.title = title;
    }
    const movieSeasons = singleEp ? [{
      seasonNumber: 0,
      title: "",
      episodes: [singleEp]
    }] : [];
    const mediaHash2 = import_crypto2.default.createHash("md5").update(resolvedPath).digest("hex").slice(0, 16);
    const mediaId2 = `media_${mediaHash2}`;
    const now2 = (/* @__PURE__ */ new Date()).toISOString();
    return {
      id: mediaId2,
      title,
      customTitle: customTitle?.trim() || void 0,
      kind: "movie",
      folderPath: resolvedPath,
      posterPath,
      backdropPath,
      totalEpisodes: movieSeasons.length,
      totalSeasons: 0,
      seasons: movieSeasons,
      createdAt: now2,
      updatedAt: now2
    };
  }
  const seasonMap = /* @__PURE__ */ new Map();
  for (const item of rawEpisodes) {
    if (!seasonMap.has(item.seasonNum)) {
      seasonMap.set(item.seasonNum, []);
    }
    seasonMap.get(item.seasonNum).push(item);
  }
  const sortedSeasonKeys = Array.from(seasonMap.keys()).sort((a, b) => a - b);
  const seasons = sortedSeasonKeys.map((sNum) => {
    const items = seasonMap.get(sNum);
    items.sort((a, b) => {
      if (a.rawEpNum !== b.rawEpNum) return a.rawEpNum - b.rawEpNum;
      return a.ep.fileName.localeCompare(b.ep.fileName, void 0, { numeric: true });
    });
    const seenEpNumbers = /* @__PURE__ */ new Set();
    let hasCollisions = false;
    for (const it of items) {
      if (seenEpNumbers.has(it.rawEpNum)) {
        hasCollisions = true;
        break;
      }
      seenEpNumbers.add(it.rawEpNum);
    }
    const resolvedEpisodes = [];
    const usedNumbers = /* @__PURE__ */ new Set();
    items.forEach((it, index) => {
      let finalEpNum = it.rawEpNum;
      if (hasCollisions || usedNumbers.has(finalEpNum) || finalEpNum <= 0) {
        finalEpNum = index + 1;
      }
      usedNumbers.add(finalEpNum);
      it.ep.seasonNumber = sNum;
      it.ep.episodeNumber = finalEpNum;
      resolvedEpisodes.push(it.ep);
    });
    return {
      seasonNumber: sNum,
      title: `Temporada ${sNum}`,
      episodes: resolvedEpisodes
    };
  });
  const totalEpisodesCount = seasons.reduce((acc, s) => acc + s.episodes.length, 0);
  const mediaHash = import_crypto2.default.createHash("md5").update(resolvedPath).digest("hex").slice(0, 16);
  const mediaId = `media_${mediaHash}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: mediaId,
    title,
    customTitle: customTitle?.trim() || void 0,
    kind: "series",
    folderPath: resolvedPath,
    posterPath,
    backdropPath,
    totalEpisodes: totalEpisodesCount,
    totalSeasons: seasons.length,
    seasons,
    createdAt: now,
    updatedAt: now
  };
}

// src/server/storage.ts
var DATA_DIR = import_path3.default.resolve(process.cwd(), "data");
var LIBRARY_FILE = import_path3.default.join(DATA_DIR, "library.json");
var THUMB_DIR = import_path3.default.join(DATA_DIR, "thumbnails");
if (!import_fs3.default.existsSync(DATA_DIR)) {
  import_fs3.default.mkdirSync(DATA_DIR, { recursive: true });
}
if (!import_fs3.default.existsSync(THUMB_DIR)) {
  import_fs3.default.mkdirSync(THUMB_DIR, { recursive: true });
}
function getThumbnailDir() {
  return THUMB_DIR;
}
function getDataDir() {
  return DATA_DIR;
}
var DEFAULT_LIBRARY = {
  version: 1,
  updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
  settings: {
    preferredAudioLanguage: "por",
    preferredSubtitleLanguage: "por",
    autoPlayNext: true
  },
  items: []
};
var cachedLibrary = null;
var writeDebounceTimer = null;
function readLibrary() {
  if (cachedLibrary) {
    return cachedLibrary;
  }
  try {
    if (!import_fs3.default.existsSync(LIBRARY_FILE)) {
      writeLibrary(DEFAULT_LIBRARY, true);
      return DEFAULT_LIBRARY;
    }
    const raw = import_fs3.default.readFileSync(LIBRARY_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.items || !Array.isArray(parsed.items)) {
      parsed.items = [];
    }
    if (deduplicateSeriesInLibrary(parsed)) {
      writeLibrary(parsed, true);
    }
    cachedLibrary = parsed;
    return parsed;
  } catch (error) {
    console.error("Error reading library.json:", error);
    return DEFAULT_LIBRARY;
  }
}
function writeLibrary(data, immediate = false) {
  data.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  cachedLibrary = data;
  const flushToDisk = () => {
    try {
      const tempFile = `${LIBRARY_FILE}.tmp`;
      import_fs3.default.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
      import_fs3.default.renameSync(tempFile, LIBRARY_FILE);
    } catch (error) {
      console.error("Error writing library.json:", error);
    }
  };
  if (immediate) {
    if (writeDebounceTimer) {
      clearTimeout(writeDebounceTimer);
      writeDebounceTimer = null;
    }
    flushToDisk();
    return;
  }
  if (writeDebounceTimer) {
    clearTimeout(writeDebounceTimer);
  }
  writeDebounceTimer = setTimeout(() => {
    writeDebounceTimer = null;
    flushToDisk();
  }, 1500);
}
function findMediaItem(id) {
  const lib = readLibrary();
  return lib.items.find((item) => item.id === id);
}
function findEpisode(mediaId, episodeId) {
  const media = findMediaItem(mediaId);
  if (!media) return void 0;
  for (const season of media.seasons) {
    const episode = season.episodes.find((ep) => ep.id === episodeId);
    if (episode) {
      return { media, episode };
    }
  }
  return void 0;
}
function updateEpisodeProgress(mediaId, episodeId, progressSeconds, durationSeconds, completed, audioIndex, subtitleIndex) {
  const lib = readLibrary();
  const media = lib.items.find((i) => i.id === mediaId);
  if (!media) return false;
  let found = false;
  for (const season of media.seasons) {
    const ep = season.episodes.find((e) => e.id === episodeId);
    if (ep) {
      ep.progressSeconds = Math.max(0, Math.floor(progressSeconds));
      if (durationSeconds && durationSeconds > 0) {
        ep.durationSeconds = durationSeconds;
      }
      if (completed !== void 0) {
        ep.watched = completed;
      } else if (ep.durationSeconds > 0 && ep.progressSeconds >= ep.durationSeconds * 0.9) {
        ep.watched = true;
      }
      if (audioIndex !== void 0) {
        ep.selectedAudioIndex = audioIndex;
      }
      if (subtitleIndex !== void 0) {
        ep.selectedSubtitleIndex = subtitleIndex;
      }
      ep.lastWatchedAt = (/* @__PURE__ */ new Date()).toISOString();
      media.lastWatchedEpisodeId = ep.id;
      media.lastWatchedAt = ep.lastWatchedAt;
      media.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      found = true;
      break;
    }
  }
  if (found) {
    writeLibrary(lib);
  }
  return found;
}
function toggleEpisodeWatched(mediaId, episodeId, watched) {
  const lib = readLibrary();
  const media = lib.items.find((i) => i.id === mediaId);
  if (!media) return false;
  for (const season of media.seasons) {
    const ep = season.episodes.find((e) => e.id === episodeId);
    if (ep) {
      ep.watched = watched !== void 0 ? watched : !ep.watched;
      if (ep.watched && ep.durationSeconds > 0) {
        ep.progressSeconds = ep.durationSeconds;
      } else if (!ep.watched) {
        ep.progressSeconds = 0;
      }
      writeLibrary(lib);
      return true;
    }
  }
  return false;
}
function relocateMediaFolder(mediaId, newFolderPath) {
  const lib = readLibrary();
  const media = lib.items.find((i) => i.id === mediaId);
  if (!media) return { success: false, message: "M\xEDdia n\xE3o encontrada" };
  if (!import_fs3.default.existsSync(newFolderPath)) {
    return { success: false, message: `Pasta n\xE3o existe: ${newFolderPath}` };
  }
  const oldFolder = media.folderPath;
  media.folderPath = newFolderPath;
  media.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  for (const season of media.seasons) {
    for (const ep of season.episodes) {
      if (ep.filePath.startsWith(oldFolder)) {
        const subPath = ep.filePath.slice(oldFolder.length).replace(/^[/\\]+/, "");
        ep.filePath = import_path3.default.join(newFolderPath, subPath);
      } else {
        const candidate = import_path3.default.join(newFolderPath, ep.fileName);
        if (import_fs3.default.existsSync(candidate)) {
          ep.filePath = candidate;
        }
      }
    }
  }
  writeLibrary(lib);
  return { success: true, message: "Pasta relocalizada com sucesso" };
}
function updateMediaBanner(mediaId, bannerUrl) {
  const lib = readLibrary();
  const media = lib.items.find((i) => i.id === mediaId);
  if (!media) return false;
  media.backdropPath = bannerUrl && bannerUrl.trim() ? bannerUrl.trim() : void 0;
  media.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  writeLibrary(lib, true);
  return true;
}
function updateMediaPoster(mediaId, posterUrl) {
  const lib = readLibrary();
  const media = lib.items.find((i) => i.id === mediaId);
  if (!media) return false;
  media.posterPath = posterUrl && posterUrl.trim() ? posterUrl.trim() : void 0;
  media.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  writeLibrary(lib, true);
  return true;
}
function updateTmdbSettings(apiKey, accessToken, language) {
  const lib = readLibrary();
  if (apiKey !== void 0) {
    lib.settings.tmdbApiKey = apiKey.trim() || void 0;
  }
  if (accessToken !== void 0) {
    lib.settings.tmdbAccessToken = accessToken.trim() || void 0;
  }
  if (language !== void 0) {
    lib.settings.tmdbLanguage = language.trim() || void 0;
  }
  writeLibrary(lib, true);
}
function cleanSeriesShowTitle(raw) {
  if (!raw) return "";
  return raw.replace(/^\[[^\]]+\]\s*/, "").replace(/[\[\(].*?[\]\)]/g, " ").replace(/\b(?:2160p|1080p|720p|480p|4k|bluray|brrip|webrip|web-dl|webdl|hdtv|x264|x265|hevc|avc|aac|dts|ddp|ac3|yify|yts|eztv|tgx|rarbg|galaxytv|dual|dublado|legendado|multi|ita|eng|por|brazilian|sub|dub|repack|proper|complete|season\s*\d+|temporada\s*\d+)\b/gi, " ").replace(/[\._]/g, " ").replace(/^[-\s.:]+|[-\s.:]+$/g, "").replace(/\s+/g, " ").trim();
}
function cleanEpisodeTitlePart(raw) {
  if (!raw) return "";
  return raw.replace(/[\[\(].*?[\]\)]/g, " ").replace(/\b(?:2160p|1080p|720p|480p|4k|bluray|brrip|webrip|web-dl|webdl|hdtv|x264|x265|hevc|avc|aac|dts|ddp|ac3|yify|yts|eztv|tgx|rarbg|galaxytv|dual|dublado|legendado|multi|ita|eng|por|brazilian|sub|dub|repack|proper)\b/gi, " ").replace(/[\._]/g, " ").replace(/^[-\s.:]+|[-\s.:]+$/g, "").replace(/\s+/g, " ").trim();
}
function extractShowAndEpisode(input) {
  if (!input) {
    return {
      isEpisode: false,
      showTitle: "",
      seasonNumber: 1,
      episodeNumber: 1,
      episodeTitle: ""
    };
  }
  const withoutExt = input.replace(/\.[a-zA-Z0-9]{2,4}$/i, "");
  const normalized = withoutExt.replace(/\\/g, "/");
  const pathParts = normalized.split("/").filter(Boolean);
  const baseName = pathParts[pathParts.length - 1] || withoutExt;
  let pathSeason;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const sMatch = pathParts[i].match(/(?:temporada|season|s)\s*(\d{1,2})/i);
    if (sMatch) {
      const parsedS = parseInt(sMatch[1], 10);
      if (parsedS > 0 && parsedS < 100) pathSeason = parsedS;
    }
  }
  const sxxExxMatch = baseName.match(/(.*?)(?:^|[\s._\-\[])[Ss](\d{1,2})[\.\s_\-]*[Ee](\d{1,3})(.*)/);
  if (sxxExxMatch) {
    const rawShow = sxxExxMatch[1] || (pathParts.length > 1 ? pathParts[0] : "");
    const sNum = parseInt(sxxExxMatch[2], 10);
    const eNum = parseInt(sxxExxMatch[3], 10);
    const rawRest = sxxExxMatch[4];
    const cleanShow = cleanSeriesShowTitle(rawShow);
    const cleanEpTitle = cleanEpisodeTitlePart(rawRest) || `Epis\xF3dio ${eNum}`;
    if (cleanShow) {
      return {
        isEpisode: true,
        showTitle: cleanShow,
        seasonNumber: sNum || pathSeason || 1,
        episodeNumber: eNum,
        episodeTitle: cleanEpTitle,
        rawEpisodeToken: `S${sNum < 10 ? "0" + sNum : sNum}E${eNum < 10 ? "0" + eNum : eNum}`
      };
    }
  }
  const xMatch = baseName.match(/(.*?)(?:^|[\s._\-\[])(\d{1,2})[xX](\d{1,3})(.*)/);
  if (xMatch) {
    const rawShow = xMatch[1] || (pathParts.length > 1 ? pathParts[0] : "");
    const sNum = parseInt(xMatch[2], 10);
    const eNum = parseInt(xMatch[3], 10);
    const rawRest = xMatch[4];
    const cleanShow = cleanSeriesShowTitle(rawShow);
    const cleanEpTitle = cleanEpisodeTitlePart(rawRest) || `Epis\xF3dio ${eNum}`;
    if (cleanShow) {
      return {
        isEpisode: true,
        showTitle: cleanShow,
        seasonNumber: sNum || pathSeason || 1,
        episodeNumber: eNum,
        episodeTitle: cleanEpTitle,
        rawEpisodeToken: `${sNum}x${eNum < 10 ? "0" + eNum : eNum}`
      };
    }
  }
  const seasonEpMatch = baseName.match(/(.*?)(?:^|[\s._\-\[])(?:temporada|season)\s*(\d{1,2})[\s\S]*?(?:episodio|episódio|ep|episode)\s*(\d{1,3})(.*)/i);
  if (seasonEpMatch) {
    const rawShow = seasonEpMatch[1] || (pathParts.length > 1 ? pathParts[0] : "");
    const sNum = parseInt(seasonEpMatch[2], 10);
    const eNum = parseInt(seasonEpMatch[3], 10);
    const rawRest = seasonEpMatch[4];
    const cleanShow = cleanSeriesShowTitle(rawShow);
    const cleanEpTitle = cleanEpisodeTitlePart(rawRest) || `Epis\xF3dio ${eNum}`;
    if (cleanShow) {
      return {
        isEpisode: true,
        showTitle: cleanShow,
        seasonNumber: sNum || pathSeason || 1,
        episodeNumber: eNum,
        episodeTitle: cleanEpTitle,
        rawEpisodeToken: `T${sNum}E${eNum}`
      };
    }
  }
  const epOnlyMatch = baseName.match(/(.*?)(?:^|[\s._\-\[])(?:[Ee][Pp]?|episodio|episódio|episode)\s*[-_.]?\s*(\d{1,4})(.*)/i);
  if (epOnlyMatch) {
    const rawShow = epOnlyMatch[1] || (pathParts.length > 1 ? pathParts[0] : "");
    const eNum = parseInt(epOnlyMatch[2], 10);
    const rawRest = epOnlyMatch[3];
    const cleanShow = cleanSeriesShowTitle(rawShow);
    const cleanEpTitle = cleanEpisodeTitlePart(rawRest) || `Epis\xF3dio ${eNum}`;
    if (cleanShow) {
      return {
        isEpisode: true,
        showTitle: cleanShow,
        seasonNumber: pathSeason || 1,
        episodeNumber: eNum,
        episodeTitle: cleanEpTitle,
        rawEpisodeToken: `E${eNum}`
      };
    }
  }
  const dashMatch = baseName.match(/^(?:\[[^\]]+\]\s*)?(.*?)\s*-\s*(\d{1,4})(?:[\s._\-\[].*)?$/);
  if (dashMatch) {
    const rawShow = dashMatch[1];
    const eNum = parseInt(dashMatch[2], 10);
    const cleanShow = cleanSeriesShowTitle(rawShow);
    if (cleanShow && eNum > 0 && eNum < 2500) {
      return {
        isEpisode: true,
        showTitle: cleanShow,
        seasonNumber: pathSeason || 1,
        episodeNumber: eNum,
        episodeTitle: `Epis\xF3dio ${eNum}`,
        rawEpisodeToken: `-${eNum}`
      };
    }
  }
  const leadingNumMatch = baseName.match(/^(\d{1,3})[\s\.\-_]+(.*)/);
  if (leadingNumMatch && pathParts.length > 1) {
    const eNum = parseInt(leadingNumMatch[1], 10);
    const rawShow = pathParts[0];
    const cleanShow = cleanSeriesShowTitle(rawShow);
    if (cleanShow && eNum > 0) {
      return {
        isEpisode: true,
        showTitle: cleanShow,
        seasonNumber: pathSeason || 1,
        episodeNumber: eNum,
        episodeTitle: cleanEpisodeTitlePart(leadingNumMatch[2]) || `Epis\xF3dio ${eNum}`,
        rawEpisodeToken: `${eNum}`
      };
    }
  }
  return {
    isEpisode: false,
    showTitle: cleanSeriesShowTitle(baseName) || baseName,
    seasonNumber: pathSeason || 1,
    episodeNumber: 1,
    episodeTitle: ""
  };
}
function normalizeSearchTitle(title) {
  if (!title) return "";
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\[\(].*?[\]\)]/g, " ").replace(/(?:[Ss]eason\s*\d*|[Tt]emporada\s*\d*|[Cc]omplete\s*[Ss]eries|[Cc]omplete|[Ee]pisode\s*\d*(?:\s*[-x]\s*\d+)?|[Ee]pisodio\s*\d*(?:\s*[-x]\s*\d+)?|[Ee]\d{1,4}(?:\s*[-xEe]\s*\d{1,4})?|[Ss]\d{1,2}(?:[-x][Ss]?\d{1,2})?|\d{1,2}[xX]\d{1,3})/gi, " ").replace(/\b\d+\s*(?:[ªº]|a\b|o\b)/gi, " ").replace(/\b(?:temp|vol|pt|part|parte)\s*\d*\b/gi, " ").replace(/\b(?:19|20)\d{2}\b/gi, " ").replace(/(?:2160p|1080p|720p|480p|4k|bluray|brrip|webrip|web-dl|webdl|hdtv|x264|x265|hevc|avc|aac|dts|ddp|ac3|yify|yts|eztv|tgx|rarbg|galaxytv|dual|dublado|legendado|multi)/gi, " ").replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}
function isTorrentSample(fileNameOrPath, length, maxLenInTorrent) {
  const norm = fileNameOrPath.toLowerCase().replace(/\\/g, "/");
  if (/(?:^|[\/._\-\[])(?:sample|trailer|featurette|extras?|bonus|promo|preview)(?:[\/._\-\]]|\.mp4|\.mkv|\.avi)/i.test(norm)) {
    return true;
  }
  if (length && maxLenInTorrent && length < 80 * 1024 * 1024 && maxLenInTorrent > 300 * 1024 * 1024) {
    return true;
  }
  return false;
}
function updateMediaKind(mediaIdOrHash, newKind) {
  const lib = readLibrary();
  const cleanKey = mediaIdOrHash.toLowerCase().trim();
  const media = lib.items.find(
    (i) => i.id === mediaIdOrHash || i.id.toLowerCase() === cleanKey || i.id === `torrent_${cleanKey}` || i.infoHash && i.infoHash.toLowerCase() === cleanKey || i.folderPath === `torrent://${cleanKey}`
  );
  if (!media) return void 0;
  media.kind = newKind;
  if (newKind === "movie") {
    media.totalSeasons = 0;
    const allEpisodes = media.seasons.flatMap((s) => s.episodes);
    const mainEp = allEpisodes[0] || {
      id: `ep_${media.id}_0`,
      seasonNumber: 0,
      episodeNumber: 1,
      title: media.title,
      fileName: "video.mp4",
      filePath: media.folderPath,
      extension: ".mp4",
      sizeBytes: 0,
      durationSeconds: 0,
      audioTracks: [],
      subtitleTracks: [],
      watched: false,
      progressSeconds: 0
    };
    mainEp.seasonNumber = 0;
    mainEp.episodeNumber = 1;
    if (!mainEp.title || mainEp.title.startsWith("Epis\xF3dio") || mainEp.title.startsWith("V\xEDdeo")) {
      mainEp.title = media.title;
    }
    media.seasons = [
      {
        seasonNumber: 0,
        title: "",
        episodes: [mainEp]
      }
    ];
    media.totalEpisodes = 1;
  } else {
    if (media.seasons.length === 0 || media.seasons.length === 1 && media.seasons[0].seasonNumber === 0) {
      if (media.seasons.length === 1) {
        media.seasons[0].seasonNumber = 1;
        media.seasons[0].title = "Temporada 1";
        media.seasons[0].episodes.forEach((e, idx) => {
          e.seasonNumber = 1;
          e.episodeNumber = idx + 1;
        });
      }
    }
    media.totalSeasons = media.seasons.length;
    media.totalEpisodes = media.seasons.reduce((acc, s) => acc + s.episodes.length, 0);
  }
  media.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  writeLibrary(lib, true);
  return media;
}
function sanitizeMediaClassification(item) {
  if (!item) return false;
  let changed = false;
  if (!Array.isArray(item.seasons)) {
    item.seasons = [];
    changed = true;
  }
  const seenPaths = /* @__PURE__ */ new Set();
  const seenTorrentKeys = /* @__PURE__ */ new Set();
  let hasRealEpisodes = false;
  for (const s of item.seasons) {
    if (Array.isArray(s?.episodes)) {
      for (const ep of s.episodes) {
        if (ep.sizeBytes && ep.sizeBytes > 0 && ep.fileName !== "video.mp4") {
          hasRealEpisodes = true;
        }
      }
    }
  }
  for (const s of item.seasons) {
    if (!Array.isArray(s?.episodes)) {
      s.episodes = [];
      changed = true;
      continue;
    }
    const cleanEps = [];
    for (const ep of s.episodes) {
      if (!ep) continue;
      if (hasRealEpisodes && ep.fileName === "video.mp4" && (!ep.sizeBytes || ep.sizeBytes === 0)) {
        changed = true;
        continue;
      }
      const torrentKey = ep.infoHash ? `${ep.infoHash.toLowerCase()}_${ep.fileIndex ?? 0}` : null;
      const fileKey = ep.filePath || ep.fileName;
      if (torrentKey && seenTorrentKeys.has(torrentKey)) {
        changed = true;
        continue;
      }
      if (fileKey && seenPaths.has(fileKey)) {
        changed = true;
        continue;
      }
      if (torrentKey) seenTorrentKeys.add(torrentKey);
      if (fileKey) seenPaths.add(fileKey);
      cleanEps.push(ep);
    }
    if (cleanEps.length !== s.episodes.length) {
      s.episodes = cleanEps;
      changed = true;
    }
  }
  let totalVideos = 0;
  for (const season of item.seasons) {
    if (Array.isArray(season?.episodes)) {
      totalVideos += season.episodes.length;
    }
  }
  const hasSeriesSeason = item.seasons.some((s) => s.seasonNumber > 0 || s.title && s.title.toLowerCase().includes("temporada"));
  const hasSeriesEpisode = item.seasons.some(
    (s) => s.episodes.some((e) => e.seasonNumber > 0 || extractShowAndEpisode(e.fileName || e.title).isEpisode)
  );
  const titleEpisodeInfo = extractShowAndEpisode(item.title);
  const hasSeriesCharacteristics = hasSeriesSeason || hasSeriesEpisode || titleEpisodeInfo.isEpisode;
  const isActuallySeries = totalVideos > 1 || totalVideos === 1 && hasSeriesCharacteristics || totalVideos === 0 && item.kind === "series";
  const expectedKind = isActuallySeries ? "series" : "movie";
  if (item.kind !== expectedKind) {
    item.kind = expectedKind;
    changed = true;
  }
  item.totalEpisodes = totalVideos;
  if (item.kind === "movie") {
    if (item.totalSeasons !== 0) {
      item.totalSeasons = 0;
      changed = true;
    }
    if (item.seasons.length > 1) {
      const allEps = item.seasons.flatMap((s) => s.episodes);
      item.seasons = [
        {
          seasonNumber: 0,
          title: "",
          episodes: allEps.slice(0, 1)
        }
      ];
      item.totalEpisodes = item.seasons[0].episodes.length;
      changed = true;
    }
    for (const season of item.seasons) {
      if (season.title) {
        season.title = "";
        changed = true;
      }
      if (season.seasonNumber !== 0) {
        season.seasonNumber = 0;
        changed = true;
      }
      for (const ep of season.episodes) {
        if (ep.seasonNumber !== 0) {
          ep.seasonNumber = 0;
          changed = true;
        }
        if (ep.episodeNumber !== 1) {
          ep.episodeNumber = 1;
          changed = true;
        }
        if (!ep.title || ep.title.toLowerCase().startsWith("epis\xF3dio") || ep.title.toLowerCase().startsWith("episodio") || ep.title.toLowerCase().startsWith("v\xEDdeo") || ep.title.toLowerCase().startsWith("video")) {
          if (item.title) {
            ep.title = item.title;
            changed = true;
          }
        }
      }
    }
  } else {
    const validSeasons = item.seasons.filter((s) => s && Array.isArray(s.episodes) && s.episodes.length > 0);
    if (validSeasons.length !== item.seasons.length) {
      item.seasons = validSeasons;
      changed = true;
    }
    if (validSeasons.length === 0 && item.seasons.length > 0) {
      validSeasons.push({
        seasonNumber: 1,
        title: "Temporada 1",
        episodes: item.seasons.flatMap((s) => s.episodes)
      });
      item.seasons = validSeasons;
      changed = true;
    }
    validSeasons.sort((a, b) => a.seasonNumber - b.seasonNumber);
    validSeasons.forEach((s, idx) => {
      const properNum = s.seasonNumber > 0 ? s.seasonNumber : idx + 1;
      if (s.seasonNumber !== properNum) {
        s.seasonNumber = properNum;
        changed = true;
      }
      const properTitle = `Temporada ${properNum}`;
      if (s.title !== properTitle) {
        s.title = properTitle;
        changed = true;
      }
      s.episodes.forEach((ep, epIdx) => {
        if (ep.seasonNumber !== properNum) {
          ep.seasonNumber = properNum;
          changed = true;
        }
        if (!ep.episodeNumber || ep.episodeNumber <= 0) {
          ep.episodeNumber = epIdx + 1;
          changed = true;
        }
      });
      s.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
    });
    const expectedSeasonsCount = validSeasons.length;
    if (item.totalSeasons !== expectedSeasonsCount) {
      item.totalSeasons = expectedSeasonsCount;
      changed = true;
    }
  }
  return changed;
}
function deduplicateSeriesInLibrary(lib) {
  let changed = false;
  for (const item of lib.items) {
    const titleInfo = extractShowAndEpisode(item.title);
    let anyEpIsSeries = false;
    for (const season of item.seasons || []) {
      for (const ep of season.episodes || []) {
        const epInfo = extractShowAndEpisode(ep.fileName || ep.filePath || ep.title);
        if (epInfo.isEpisode) {
          anyEpIsSeries = true;
          if (ep.seasonNumber === 0 && epInfo.seasonNumber > 0) {
            ep.seasonNumber = epInfo.seasonNumber;
            changed = true;
          }
          if (epInfo.episodeNumber > 0 && (!ep.episodeNumber || ep.episodeNumber === 1 || ep.episodeNumber !== epInfo.episodeNumber)) {
            ep.episodeNumber = epInfo.episodeNumber;
            changed = true;
          }
          if (epInfo.episodeTitle && (!ep.title || ep.title.startsWith("Epis\xF3dio") || ep.title.startsWith("V\xEDdeo"))) {
            ep.title = epInfo.episodeTitle;
            changed = true;
          }
        }
      }
    }
    if (titleInfo.isEpisode || anyEpIsSeries) {
      if (item.kind !== "series") {
        item.kind = "series";
        changed = true;
      }
      if (titleInfo.isEpisode && titleInfo.showTitle && !item.customTitle) {
        if (item.title !== titleInfo.showTitle) {
          item.title = titleInfo.showTitle;
          changed = true;
        }
      }
    }
    if (sanitizeMediaClassification(item)) {
      changed = true;
    }
  }
  const mergedItems = [];
  for (const item of lib.items) {
    if (item.kind !== "series") {
      mergedItems.push(item);
      continue;
    }
    const normKey = normalizeSearchTitle(item.title);
    if (!normKey) {
      mergedItems.push(item);
      continue;
    }
    const targetIdx = mergedItems.findIndex((m) => {
      if (m.kind !== "series") return false;
      if (item.tmdbId && m.tmdbId && item.tmdbId === m.tmdbId) return true;
      const mNorm = normalizeSearchTitle(m.title);
      return mNorm === normKey;
    });
    if (targetIdx >= 0) {
      const target = mergedItems[targetIdx];
      changed = true;
      if (!target.backdropPath && item.backdropPath) target.backdropPath = item.backdropPath;
      if (!target.posterPath && item.posterPath) target.posterPath = item.posterPath;
      if (!target.overview && item.overview) target.overview = item.overview;
      if (!target.tmdbId && item.tmdbId) target.tmdbId = item.tmdbId;
      for (const itemSeason of item.seasons) {
        const sNum = itemSeason.seasonNumber > 0 ? itemSeason.seasonNumber : 1;
        let targetSeason = target.seasons.find((s) => s.seasonNumber === sNum);
        if (!targetSeason) {
          targetSeason = {
            seasonNumber: sNum,
            title: `Temporada ${sNum}`,
            episodes: []
          };
          target.seasons.push(targetSeason);
        }
        for (const ep of itemSeason.episodes) {
          ep.seasonNumber = sNum;
          const existingEp = targetSeason.episodes.find(
            (e) => e.episodeNumber === ep.episodeNumber && e.episodeNumber > 0 || ep.infoHash && e.infoHash && e.infoHash.toLowerCase() === ep.infoHash.toLowerCase() && e.fileIndex === ep.fileIndex || e.id === ep.id
          );
          if (existingEp) {
            if (ep.isTorrent) {
              existingEp.isTorrent = true;
              if (ep.infoHash) existingEp.infoHash = ep.infoHash;
              if (ep.magnetUri) existingEp.magnetUri = ep.magnetUri;
              if (ep.fileIndex !== void 0) existingEp.fileIndex = ep.fileIndex;
              if (ep.filePath) existingEp.filePath = ep.filePath;
            }
            if (ep.watched) existingEp.watched = true;
            if (ep.progressSeconds > existingEp.progressSeconds) {
              existingEp.progressSeconds = ep.progressSeconds;
              existingEp.durationSeconds = ep.durationSeconds || existingEp.durationSeconds;
            }
          } else {
            targetSeason.episodes.push(ep);
          }
        }
      }
      sanitizeMediaClassification(target);
    } else {
      mergedItems.push(item);
    }
  }
  if (mergedItems.length !== lib.items.length) {
    changed = true;
  }
  if (changed) {
    lib.items = mergedItems;
  }
  return changed;
}
var TORRENT_VIDEO_EXTS = /* @__PURE__ */ new Set([".mp4", ".mkv", ".avi", ".webm", ".mov", ".m4v", ".wmv", ".flv", ".ts"]);
function saveTorrentMediaItem(params) {
  const lib = readLibrary();
  deduplicateSeriesInLibrary(lib);
  const cleanHash = params.infoHash.toLowerCase();
  const mediaId = `torrent_${cleanHash}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const rawFiles = params.files || [];
  const maxFileLen = rawFiles.reduce((acc, f2) => Math.max(acc, f2.length || 0), 0);
  const videoFiles = rawFiles.filter((f2) => {
    const ext = import_path3.default.extname(f2.name || f2.path || "").toLowerCase();
    if (!TORRENT_VIDEO_EXTS.has(ext)) return false;
    if (rawFiles.length > 1 && isTorrentSample(f2.name || f2.path || "", f2.length, maxFileLen)) {
      return false;
    }
    return true;
  });
  const displayFiles = videoFiles.length > 0 ? videoFiles : rawFiles.filter((f2) => TORRENT_VIDEO_EXTS.has(import_path3.default.extname(f2.name || f2.path || "").toLowerCase()));
  const rawTorrentName = params.name || `Torrent ${cleanHash.slice(0, 8)}`;
  const parsedTorrentTitle = extractShowAndEpisode(rawTorrentName);
  const fileParsedList = displayFiles.map((f2, idx) => {
    const parsedFile = extractShowAndEpisode(f2.path || f2.name);
    return {
      file: f2,
      index: f2.index ?? idx,
      parsed: parsedFile
    };
  });
  const anyFileIsEpisode = fileParsedList.some((item) => item.parsed.isEpisode);
  const isSeriesTorrent = parsedTorrentTitle.isEpisode || anyFileIsEpisode || displayFiles.length > 1;
  const cleanTitle = isSeriesTorrent && parsedTorrentTitle.showTitle || fileParsedList[0]?.parsed.isEpisode && fileParsedList[0].parsed.showTitle || cleanSeriesShowTitle(rawTorrentName) || rawTorrentName;
  const normalizedTitleKey = normalizeSearchTitle(cleanTitle);
  let existingIndex = lib.items.findIndex((item) => {
    if (item.id === mediaId) return true;
    if (item.infoHash && item.infoHash.toLowerCase() === cleanHash) return true;
    const itemNorm = normalizeSearchTitle(item.title);
    if (normalizedTitleKey && itemNorm && itemNorm === normalizedTitleKey) return true;
    return false;
  });
  const existing = existingIndex >= 0 ? lib.items[existingIndex] : void 0;
  if (isSeriesTorrent) {
    const episodesToAdd = [];
    if (displayFiles.length === 0) {
      const sNum = parsedTorrentTitle.seasonNumber || 1;
      const eNum = parsedTorrentTitle.episodeNumber || 1;
      const epId2 = `ep_torrent_${cleanHash}_0`;
      episodesToAdd.push({
        id: epId2,
        seasonNumber: sNum,
        episodeNumber: eNum,
        title: parsedTorrentTitle.episodeTitle || cleanTitle || `Epis\xF3dio ${eNum}`,
        fileName: rawTorrentName || "video.mp4",
        filePath: `torrent://${cleanHash}/0`,
        extension: ".mp4",
        sizeBytes: params.totalBytes || 0,
        durationSeconds: 0,
        audioTracks: [],
        subtitleTracks: [],
        watched: false,
        progressSeconds: 0,
        isTorrent: true,
        fileIndex: 0,
        magnetUri: params.magnetUri,
        infoHash: cleanHash
      });
    } else {
      fileParsedList.forEach((it, idx) => {
        const sNum = it.parsed.isEpisode ? it.parsed.seasonNumber : parsedTorrentTitle.seasonNumber || 1;
        const eNum = it.parsed.isEpisode ? it.parsed.episodeNumber : parsedTorrentTitle.episodeNumber && displayFiles.length === 1 ? parsedTorrentTitle.episodeNumber : idx + 1;
        const epTitle = it.parsed.isEpisode && it.parsed.episodeTitle || (parsedTorrentTitle.episodeTitle && displayFiles.length === 1 ? parsedTorrentTitle.episodeTitle : `Epis\xF3dio ${eNum}`);
        const epId2 = `ep_torrent_${cleanHash}_${it.index}`;
        episodesToAdd.push({
          id: epId2,
          seasonNumber: sNum,
          episodeNumber: eNum,
          title: epTitle,
          fileName: it.file.name,
          filePath: `torrent://${cleanHash}/${it.index}`,
          extension: import_path3.default.extname(it.file.name).toLowerCase() || ".mp4",
          sizeBytes: it.file.length || 0,
          durationSeconds: 0,
          audioTracks: [],
          subtitleTracks: [],
          watched: false,
          progressSeconds: 0,
          isTorrent: true,
          fileIndex: it.index,
          magnetUri: params.magnetUri,
          infoHash: cleanHash
        });
      });
    }
    let targetItem;
    if (existing) {
      targetItem = existing;
      targetItem.kind = "series";
      targetItem.title = targetItem.customTitle || cleanTitle || targetItem.title;
      targetItem.updatedAt = now;
      for (const newEp of episodesToAdd) {
        let seasonObj = targetItem.seasons.find((s) => s.seasonNumber === newEp.seasonNumber);
        if (!seasonObj) {
          seasonObj = {
            seasonNumber: newEp.seasonNumber,
            title: `Temporada ${newEp.seasonNumber}`,
            episodes: []
          };
          targetItem.seasons.push(seasonObj);
        }
        const existingEpIdx = seasonObj.episodes.findIndex(
          (e) => e.episodeNumber === newEp.episodeNumber && e.episodeNumber > 0 || e.infoHash?.toLowerCase() === cleanHash && e.fileIndex === newEp.fileIndex || e.id === newEp.id
        );
        if (existingEpIdx >= 0) {
          const oldEp = seasonObj.episodes[existingEpIdx];
          seasonObj.episodes[existingEpIdx] = {
            ...oldEp,
            ...newEp,
            durationSeconds: oldEp.durationSeconds || newEp.durationSeconds,
            progressSeconds: oldEp.progressSeconds || newEp.progressSeconds,
            watched: oldEp.watched || newEp.watched,
            selectedAudioIndex: oldEp.selectedAudioIndex,
            selectedSubtitleIndex: oldEp.selectedSubtitleIndex,
            subtitleTracks: [...newEp.subtitleTracks || [], ...(oldEp.subtitleTracks || []).filter((t) => t.isImported)]
          };
        } else {
          seasonObj.episodes.push(newEp);
        }
      }
    } else {
      const seasonMap = /* @__PURE__ */ new Map();
      for (const ep of episodesToAdd) {
        if (!seasonMap.has(ep.seasonNumber)) {
          seasonMap.set(ep.seasonNumber, []);
        }
        seasonMap.get(ep.seasonNumber).push(ep);
      }
      const seasons = Array.from(seasonMap.entries()).map(([sNum, eps]) => ({
        seasonNumber: sNum,
        title: `Temporada ${sNum}`,
        episodes: eps
      }));
      targetItem = {
        id: mediaId,
        title: cleanTitle,
        kind: "series",
        folderPath: `torrent://${cleanHash}`,
        isTorrent: true,
        magnetUri: params.magnetUri,
        infoHash: cleanHash,
        totalEpisodes: episodesToAdd.length,
        totalSeasons: seasons.length,
        seasons,
        createdAt: now,
        updatedAt: now
      };
      lib.items.unshift(targetItem);
    }
    sanitizeMediaClassification(targetItem);
    writeLibrary(lib, true);
    return targetItem;
  }
  const f = displayFiles[0] || { name: rawTorrentName, length: params.totalBytes || 0, index: 0 };
  const epId = `ep_torrent_${cleanHash}_${f.index ?? 0}`;
  let prevProgress = 0;
  let prevDuration = 0;
  let prevWatched = false;
  if (existing) {
    for (const s of existing.seasons) {
      for (const e of s.episodes) {
        if (e.progressSeconds > prevProgress) prevProgress = e.progressSeconds;
        if (e.durationSeconds > prevDuration) prevDuration = e.durationSeconds;
        if (e.watched) prevWatched = true;
      }
    }
  }
  const singleEp = {
    id: epId,
    seasonNumber: 0,
    episodeNumber: 1,
    title: existing?.customTitle || cleanTitle,
    fileName: f.name,
    filePath: `torrent://${cleanHash}/${f.index ?? 0}`,
    extension: import_path3.default.extname(f.name).toLowerCase() || ".mp4",
    sizeBytes: f.length || params.totalBytes || 0,
    durationSeconds: prevDuration,
    audioTracks: [],
    subtitleTracks: [],
    watched: prevWatched,
    progressSeconds: prevProgress,
    isTorrent: true,
    fileIndex: f.index ?? 0,
    magnetUri: params.magnetUri,
    infoHash: cleanHash
  };
  const movieSeasons = [
    {
      seasonNumber: 0,
      title: "",
      episodes: [singleEp]
    }
  ];
  let itemToReturn;
  if (existing) {
    existing.title = existing.customTitle || existing.title || cleanTitle;
    existing.folderPath = existing.folderPath || `torrent://${cleanHash}`;
    existing.magnetUri = params.magnetUri || existing.magnetUri;
    existing.infoHash = cleanHash;
    existing.isTorrent = true;
    existing.kind = "movie";
    existing.seasons = movieSeasons;
    existing.totalEpisodes = 1;
    existing.totalSeasons = 0;
    existing.updatedAt = now;
    sanitizeMediaClassification(existing);
    itemToReturn = existing;
  } else {
    itemToReturn = {
      id: mediaId,
      title: cleanTitle,
      kind: "movie",
      folderPath: `torrent://${cleanHash}`,
      isTorrent: true,
      magnetUri: params.magnetUri,
      infoHash: cleanHash,
      totalEpisodes: 1,
      totalSeasons: 0,
      seasons: movieSeasons,
      createdAt: now,
      updatedAt: now
    };
    sanitizeMediaClassification(itemToReturn);
    lib.items.unshift(itemToReturn);
  }
  writeLibrary(lib, true);
  return itemToReturn;
}
function updateTorrentProgressInLibrary(infoHash, selectedFileIndex, progressSeconds, durationSeconds) {
  const lib = readLibrary();
  const cleanHash = infoHash.toLowerCase();
  let found = false;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const media of lib.items) {
    for (const season of media.seasons) {
      for (const ep of season.episodes) {
        if (ep.infoHash && ep.infoHash.toLowerCase() === cleanHash && ep.fileIndex === selectedFileIndex || media.infoHash && media.infoHash.toLowerCase() === cleanHash && ep.fileIndex === selectedFileIndex || ep.id === `ep_torrent_${cleanHash}_${selectedFileIndex}`) {
          ep.progressSeconds = Math.max(0, Math.floor(progressSeconds));
          if (durationSeconds && durationSeconds > 0) {
            ep.durationSeconds = Math.floor(durationSeconds);
          }
          if (ep.durationSeconds > 0 && ep.progressSeconds >= ep.durationSeconds * 0.9) {
            ep.watched = true;
          }
          ep.lastWatchedAt = now;
          media.lastWatchedEpisodeId = ep.id;
          media.lastWatchedAt = now;
          media.updatedAt = now;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) break;
  }
  if (found) {
    writeLibrary(lib);
  }
  return found;
}
function removeTorrentFromLibrary(infoHash) {
  const lib = readLibrary();
  const cleanHash = infoHash.toLowerCase();
  let changed = false;
  const updatedItems = [];
  for (const item of lib.items) {
    if (item.id === `torrent_${cleanHash}` && (!item.seasons || item.seasons.length === 0)) {
      changed = true;
      continue;
    }
    if (item.kind === "series") {
      let itemModified = false;
      for (const season of item.seasons) {
        const initialCount = season.episodes.length;
        season.episodes = season.episodes.filter((ep) => ep.infoHash?.toLowerCase() !== cleanHash);
        if (season.episodes.length !== initialCount) {
          itemModified = true;
        }
      }
      item.seasons = item.seasons.filter((s) => s.episodes.length > 0);
      item.totalEpisodes = item.seasons.reduce((acc, s) => acc + s.episodes.length, 0);
      item.totalSeasons = item.seasons.length;
      if (itemModified) changed = true;
      if (item.isTorrent && item.totalEpisodes === 0) {
        changed = true;
        continue;
      }
    } else if (item.infoHash?.toLowerCase() === cleanHash || item.id === `torrent_${cleanHash}`) {
      changed = true;
      continue;
    }
    updatedItems.push(item);
  }
  if (changed) {
    lib.items = updatedItems;
    writeLibrary(lib, true);
    return true;
  }
  return false;
}
var IPTV_STATUS_FILE = import_path3.default.join(DATA_DIR, "iptv_status.json");
var iptvStatusCache = null;
function readIptvStatusMap() {
  if (iptvStatusCache) return iptvStatusCache;
  try {
    if (import_fs3.default.existsSync(IPTV_STATUS_FILE)) {
      const content = import_fs3.default.readFileSync(IPTV_STATUS_FILE, "utf-8");
      iptvStatusCache = JSON.parse(content);
      return iptvStatusCache || {};
    }
  } catch (err) {
    console.error("Erro ao ler iptv_status.json:", err);
  }
  iptvStatusCache = {};
  return iptvStatusCache;
}
function saveIptvStatusMap(data) {
  iptvStatusCache = data;
  try {
    import_fs3.default.writeFileSync(IPTV_STATUS_FILE, JSON.stringify(data), "utf-8");
  } catch (err) {
    console.error("Erro ao gravar iptv_status.json:", err);
  }
}
async function rescanAllLibraryFolders() {
  const lib = readLibrary();
  let updatedCount = 0;
  await Promise.all(
    lib.items.map(async (item, i) => {
      if (item.isTorrent || item.folderPath.startsWith("torrent://")) {
        if (sanitizeMediaClassification(item)) {
          updatedCount++;
        }
        return;
      }
      if (!import_fs3.default.existsSync(item.folderPath)) {
        if (sanitizeMediaClassification(item)) {
          updatedCount++;
        }
        return;
      }
      try {
        const updatedItem = await scanMediaFolder(item.folderPath, item.customTitle);
        for (const newSeason of updatedItem.seasons) {
          const oldSeason = item.seasons?.find((s) => s.seasonNumber === newSeason.seasonNumber);
          if (oldSeason) {
            for (const newEp of newSeason.episodes) {
              const oldEp = oldSeason.episodes?.find(
                (e) => e.fileName === newEp.fileName || e.episodeNumber === newEp.episodeNumber && e.seasonNumber === newEp.seasonNumber
              );
              if (oldEp) {
                newEp.watched = oldEp.watched;
                newEp.progressSeconds = oldEp.progressSeconds;
                newEp.lastWatchedAt = oldEp.lastWatchedAt;
                newEp.selectedAudioIndex = oldEp.selectedAudioIndex;
                newEp.selectedSubtitleIndex = oldEp.selectedSubtitleIndex;
                newEp.subtitleTracks = [
                  ...newEp.subtitleTracks,
                  ...(oldEp.subtitleTracks || []).filter((track) => track.isImported)
                ];
              }
            }
          }
        }
        updatedItem.lastWatchedEpisodeId = item.lastWatchedEpisodeId;
        updatedItem.lastWatchedAt = item.lastWatchedAt;
        updatedItem.customTitle = item.customTitle;
        updatedItem.tmdbId = updatedItem.tmdbId || item.tmdbId;
        updatedItem.metadataProvider = updatedItem.metadataProvider || item.metadataProvider;
        updatedItem.originalTitle = updatedItem.originalTitle || item.originalTitle;
        updatedItem.year = updatedItem.year || item.year;
        updatedItem.overview = updatedItem.overview || item.overview;
        updatedItem.tagline = updatedItem.tagline || item.tagline;
        updatedItem.genres = updatedItem.genres?.length ? updatedItem.genres : item.genres;
        updatedItem.rating = updatedItem.rating ?? item.rating;
        updatedItem.voteCount = updatedItem.voteCount ?? item.voteCount;
        updatedItem.cast = updatedItem.cast?.length ? updatedItem.cast : item.cast;
        if (item.backdropPath && !updatedItem.backdropPath) {
          updatedItem.backdropPath = item.backdropPath;
        }
        if (item.posterPath && !updatedItem.posterPath) {
          updatedItem.posterPath = item.posterPath;
        }
        lib.items[i] = updatedItem;
        updatedCount++;
      } catch (err) {
        console.warn(`[Auto-rescan] Falha ao re-escanear pasta "${item.folderPath}":`, err);
        if (sanitizeMediaClassification(item)) {
          updatedCount++;
        }
      }
    })
  );
  deduplicateSeriesInLibrary(lib);
  writeLibrary(lib, true);
  return { updatedCount, library: lib };
}

// src/server/tmdb.ts
var import_fs4 = __toESM(require("fs"), 1);
var import_path4 = __toESM(require("path"), 1);
var TMDB_API_BASE = "https://api.themoviedb.org/3";
var TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
var DEFAULT_LANGUAGE = "pt-BR";
var REQUEST_TIMEOUT_MS = 15e3;
function getApiKey() {
  const envKey = process.env.TMDB_API_KEY?.trim();
  if (envKey) return envKey;
  try {
    const lib = readLibrary();
    const settingKey = lib.settings.tmdbApiKey?.trim();
    if (settingKey) return settingKey;
  } catch {
  }
  return void 0;
}
function getAccessToken() {
  const envToken = process.env.TMDB_ACCESS_TOKEN?.trim();
  if (envToken) return envToken;
  try {
    const lib = readLibrary();
    const settingToken = lib.settings.tmdbAccessToken?.trim();
    if (settingToken) return settingToken;
  } catch {
  }
  return void 0;
}
function isTmdbConfigured() {
  return Boolean(getApiKey() || getAccessToken());
}
function getLanguage() {
  const envLang = process.env.TMDB_LANGUAGE?.trim();
  if (envLang) return envLang;
  try {
    const lib = readLibrary();
    const settingLang = lib.settings.tmdbLanguage?.trim();
    if (settingLang) return settingLang;
  } catch {
  }
  return DEFAULT_LANGUAGE;
}
function normalizeSearchTitle2(title) {
  return title.replace(/(?:^|[\s._-])[Ss]\d{1,2}(?:[-_. ][Ss]\d{1,2})?(?:[Ee]\d{1,3})?(?:[-_. ]*[Ee]\d{1,3})?/g, " ").replace(/(?:temporada|season)\s*\d+/gi, " ").replace(/(?:complete\s*series|complete\s*season|complete)/gi, " ").replace(/[._]/g, " ").replace(/[\[\(].*?[\]\)]/g, " ").replace(/\b(?:2160p|1080p|720p|480p|4k|bluray|brrip|webrip|web[- ]?dl|webdl|hdtv|x26[45]|hevc|avc|aac|dts|ddp|ac3|remux|proper|repack|yify|yts|eztv|rarbg|tgx|dual|dublado|legendado|multi)\b/gi, " ").replace(/\s+/g, " ").trim();
}
function imageUrl(imagePath, size) {
  return imagePath ? `${TMDB_IMAGE_BASE}/${size}${imagePath}` : void 0;
}
async function requestTmdb(endpoint, params = {}) {
  const apiKey = getApiKey();
  const accessToken = getAccessToken();
  if (!apiKey && !accessToken) {
    throw new Error("TMDb n\xE3o configurado");
  }
  const url = new URL(`${TMDB_API_BASE}${endpoint}`);
  url.searchParams.set("language", getLanguage());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : void 0,
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`TMDb respondeu HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
async function downloadImage(url, destination) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (!response.ok) return false;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return false;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > 25 * 1024 * 1024) return false;
    import_fs4.default.mkdirSync(import_path4.default.dirname(destination), { recursive: true });
    import_fs4.default.writeFileSync(destination, bytes);
    return true;
  } catch (error) {
    console.warn("[TMDb] N\xE3o foi poss\xEDvel baixar imagem:", error instanceof Error ? error.message : error);
    return false;
  }
}
async function cacheImage(mediaId, kind, remoteUrl) {
  if (!remoteUrl) return void 0;
  const destination = import_path4.default.join(getDataDir(), "metadata", mediaId, `${kind}.jpg`);
  if (import_fs4.default.existsSync(destination) && import_fs4.default.statSync(destination).size > 0) {
    return destination;
  }
  return await downloadImage(remoteUrl, destination) ? destination : remoteUrl;
}
function mapCast(cast) {
  return (cast || []).slice(0, 20).map((member) => ({
    id: member.id,
    name: member.name,
    character: member.character || void 0,
    profilePath: imageUrl(member.profile_path, "w500")
  }));
}
function getResultTitle(result) {
  return result.title || result.name || result.original_title || result.original_name || "";
}
function getResultDate(result) {
  return result.release_date || result.first_air_date || void 0;
}
function chooseSearchResult(results, query) {
  if (results.length === 0) return void 0;
  const normalizedQuery = normalizeSearchTitle2(query).toLocaleLowerCase();
  return [...results].sort((a, b) => {
    const aTitle = getResultTitle(a).toLocaleLowerCase();
    const bTitle = getResultTitle(b).toLocaleLowerCase();
    const aExact = aTitle === normalizedQuery ? 1 : 0;
    const bExact = bTitle === normalizedQuery ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    return (b.vote_count || 0) - (a.vote_count || 0);
  })[0];
}
async function findMedia(query, kind) {
  const cleanQuery = normalizeSearchTitle2(query);
  const queriesToTry = [cleanQuery, query.trim()].filter(Boolean);
  for (const q of [...new Set(queriesToTry)]) {
    const primaryEndpoint = kind === "movie" ? "/search/movie" : "/search/tv";
    try {
      const response = await requestTmdb(primaryEndpoint, { query: q, include_adult: "false" });
      const match = chooseSearchResult(response.results || [], q);
      if (match) return match;
    } catch {
    }
    const secondaryEndpoint = kind === "movie" ? "/search/tv" : "/search/movie";
    try {
      const response = await requestTmdb(secondaryEndpoint, { query: q, include_adult: "false" });
      const match = chooseSearchResult(response.results || [], q);
      if (match) return match;
    } catch {
    }
    try {
      const response = await requestTmdb("/search/multi", { query: q, include_adult: "false" });
      const filtered = (response.results || []).filter((r) => r.media_type === "movie" || r.media_type === "tv" || !r.media_type);
      const match = chooseSearchResult(filtered, q);
      if (match) return match;
    } catch {
    }
  }
  return void 0;
}
function applyMediaDetail(media, detail) {
  const date = getResultDate(detail);
  if (!media.customTitle) {
    media.title = getResultTitle(detail) || media.title;
  }
  media.originalTitle = detail.original_title || detail.original_name || media.originalTitle;
  media.year = date ? Number.parseInt(date.slice(0, 4), 10) || void 0 : media.year;
  media.overview = detail.overview || media.overview;
  media.tagline = detail.tagline || void 0;
  media.genres = (detail.genres || []).map((genre) => genre.name).filter(Boolean);
  media.rating = typeof detail.vote_average === "number" ? detail.vote_average : void 0;
  media.voteCount = typeof detail.vote_count === "number" ? detail.vote_count : void 0;
  media.tmdbId = detail.id;
  media.metadataProvider = "tmdb";
  media.cast = mapCast(detail.credits?.cast);
}
function applyEpisodeDetail(episode, tmdbEpisode) {
  if (tmdbEpisode.episode_number !== episode.episodeNumber) return;
  episode.tmdbId = tmdbEpisode.id;
  episode.title = tmdbEpisode.name || episode.title;
  episode.overview = tmdbEpisode.overview || void 0;
  episode.airDate = tmdbEpisode.air_date || void 0;
  episode.rating = typeof tmdbEpisode.vote_average === "number" ? tmdbEpisode.vote_average : void 0;
  episode.stillPath = imageUrl(tmdbEpisode.still_path, "w500");
}
async function enrichSeriesEpisodes(media, tmdbId) {
  await Promise.all(media.seasons.map(async (season) => {
    try {
      const seasonData = await requestTmdb(`/tv/${tmdbId}/season/${season.seasonNumber}`);
      for (const episode of season.episodes) {
        const tmdbEpisode = seasonData.episodes?.find((item) => item.episode_number === episode.episodeNumber);
        if (tmdbEpisode) {
          applyEpisodeDetail(episode, tmdbEpisode);
          episode.stillPath = await cacheImage(media.id, `episode-${episode.id}`, episode.stillPath);
        }
      }
    } catch (error) {
      console.warn(`[TMDb] N\xE3o foi poss\xEDvel carregar a temporada ${season.seasonNumber}:`, error instanceof Error ? error.message : error);
    }
  }));
}
async function searchTmdb(query, kind) {
  if (!isTmdbConfigured()) return [];
  const cleanQuery = normalizeSearchTitle2(query);
  const q = cleanQuery || query.trim();
  if (!q) return [];
  try {
    if (kind === "movie") {
      const res = await requestTmdb("/search/movie", { query: q, include_adult: "false" });
      return res.results || [];
    } else if (kind === "series") {
      const res = await requestTmdb("/search/tv", { query: q, include_adult: "false" });
      return res.results || [];
    } else {
      const res = await requestTmdb("/search/multi", { query: q, include_adult: "false" });
      return (res.results || []).filter((r) => r.media_type === "movie" || r.media_type === "tv" || !r.media_type);
    }
  } catch (error) {
    console.warn("[TMDb] Falha ao pesquisar t\xEDtulos:", error instanceof Error ? error.message : error);
    return [];
  }
}
async function enrichMediaWithTmdb(media, customQuery, explicitTmdbId) {
  if (!isTmdbConfigured()) {
    throw new Error("Chave da API do TMDb n\xE3o configurada no servidor.");
  }
  const query = customQuery?.trim() || media.customTitle || media.title || import_path4.default.basename(media.folderPath);
  let targetId = explicitTmdbId;
  if (!targetId) {
    const searchResult = await findMedia(query, media.kind);
    if (!searchResult) {
      throw new Error(`Nenhum t\xEDtulo encontrado no TMDb para "${query}". Tente buscar digitando o nome exato na barra de busca.`);
    }
    targetId = searchResult.id;
  }
  const endpoint = media.kind === "movie" ? `/movie/${targetId}` : `/tv/${targetId}`;
  let detail;
  try {
    detail = await requestTmdb(endpoint, { append_to_response: "credits" });
  } catch (err) {
    const fallbackEndpoint = media.kind === "movie" ? `/tv/${targetId}` : `/movie/${targetId}`;
    detail = await requestTmdb(fallbackEndpoint, { append_to_response: "credits" });
  }
  applyMediaDetail(media, detail);
  const posterUrl = imageUrl(detail.poster_path, "w500");
  const backdropUrl = imageUrl(detail.backdrop_path, "w780");
  const [posterPath, backdropPath] = await Promise.all([
    cacheImage(media.id, "poster", posterUrl),
    cacheImage(media.id, "backdrop", backdropUrl)
  ]);
  if (posterPath) {
    media.posterPath = posterPath;
  } else if (posterUrl) {
    media.posterPath = posterUrl;
  }
  if (backdropPath) {
    media.backdropPath = backdropPath;
  } else if (backdropUrl) {
    media.backdropPath = backdropUrl;
  }
  if (media.kind === "series") {
    await enrichSeriesEpisodes(media, detail.id);
    for (const season of media.seasons) {
      season.title = `Temporada ${season.seasonNumber}`;
    }
  } else {
    media.totalSeasons = 0;
    for (const season of media.seasons) {
      season.seasonNumber = 0;
      season.title = "";
      if (season.episodes[0] && (!season.episodes[0].title || season.episodes[0].title.startsWith("Epis\xF3dio") || season.episodes[0].title.startsWith("V\xEDdeo"))) {
        season.episodes[0].title = media.title;
      }
    }
  }
  return media;
}

// src/server/opensubtitles.ts
var import_crypto3 = __toESM(require("crypto"), 1);
var import_fs5 = __toESM(require("fs"), 1);
var import_path5 = __toESM(require("path"), 1);
var DEFAULT_API_ORIGIN = "https://api.opensubtitles.com";
var APP_USER_AGENT = "CineLocal/0.2";
var REQUEST_TIMEOUT_MS2 = 15e3;
var cachedSession = null;
var DEFAULT_API_KEY = "neEqFAdRQC2PpeMiOZi06dw0qiKf6X5d";
var DEFAULT_USERNAME = "oevidente";
var DEFAULT_PASSWORD = "Oevdt.51190";
function getApiKey2() {
  return process.env.OPENSUBTITLES_API_KEY?.trim() || DEFAULT_API_KEY;
}
function getUsername() {
  return process.env.OPENSUBTITLES_USERNAME?.trim() || DEFAULT_USERNAME;
}
function getPassword() {
  return process.env.OPENSUBTITLES_PASSWORD || DEFAULT_PASSWORD;
}
function isOpenSubtitlesConfigured() {
  return Boolean(getApiKey2());
}
function isOpenSubtitlesAccountConfigured() {
  return Boolean(getUsername() && getPassword());
}
function getOpenSubtitlesUsername() {
  return getUsername();
}
function normalizeLanguage(language) {
  const value = language.trim().toLowerCase();
  if (value === "por" || value === "pt" || value === "pt-br" || value === "pt_br") return "pt-br";
  if (value === "eng") return "en";
  return value || "pt-br";
}
function apiOrigin(value) {
  if (!value) return DEFAULT_API_ORIGIN;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "").replace(/\/api\/v1$/i, "");
}
function makeApiUrl(origin, endpoint) {
  return `${apiOrigin(origin)}/api/v1${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}
function cleanSearchTitle(title) {
  return title.replace(/(?:^|[\s._-])[Ss]\d{1,2}(?:[Ee]\d{1,3})?(?:[-_. ]*[Ee]\d{1,3})?/g, " ").replace(/[._]/g, " ").replace(/[\[\(].*?[\]\)]/g, " ").replace(/\b(?:2160p|1080p|720p|480p|4k|bluray|brrip|webrip|web[- ]?dl|hdtv|x26[45]|hevc|aac|dts|remux|proper|repack)\b/gi, " ").replace(/\s+/g, " ").trim();
}
async function requestOpenSubtitles(endpoint, init = {}, requireLogin = false, isRetry = false) {
  const apiKey = getApiKey2();
  if (!apiKey) {
    throw new Error("OpenSubtitles n\xE3o configurado. Defina OPENSUBTITLES_API_KEY.");
  }
  const session = requireLogin ? await ensureSession() : cachedSession;
  const headers = new Headers(init.headers);
  headers.set("Api-Key", apiKey);
  headers.set("User-Agent", process.env.OPENSUBTITLES_USER_AGENT?.trim() || APP_USER_AGENT);
  headers.set("Accept", "application/json");
  if (session?.token) headers.set("Authorization", `Bearer ${session.token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(makeApiUrl(session?.origin || DEFAULT_API_ORIGIN, endpoint), {
    ...init,
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS2)
  });
  if (!response.ok) {
    if (response.status === 401 && requireLogin && !isRetry) {
      clearOpenSubtitlesSession();
      return requestOpenSubtitles(endpoint, init, true, true);
    }
    let message = `OpenSubtitles respondeu HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody.message) message = errorBody.message;
    } catch {
    }
    throw new Error(message);
  }
  return await response.json();
}
async function ensureSession() {
  if (cachedSession?.token) return cachedSession;
  const username = getUsername();
  const password = getPassword();
  if (!username || !password) {
    throw new Error("Para baixar legendas, configure OPENSUBTITLES_USERNAME e OPENSUBTITLES_PASSWORD.");
  }
  const response = await requestOpenSubtitles("/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  if (!response.token) throw new Error("OpenSubtitles n\xE3o retornou um token de sess\xE3o.");
  cachedSession = {
    token: response.token,
    origin: apiOrigin(response.base_url)
  };
  return cachedSession;
}
function clearOpenSubtitlesSession() {
  cachedSession = null;
}
function safeFileName(value) {
  return value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").replace(/\s+/g, " ").trim().slice(0, 180) || "legenda";
}
function resultToOption(result) {
  const attributes = result.attributes || {};
  const file = attributes.files?.[0];
  if (!file || !Number.isFinite(Number(file.file_id))) return null;
  return {
    id: result.id,
    fileId: Number(file.file_id),
    language: attributes.language || "und",
    languageName: attributes.language_name,
    release: attributes.release,
    fileName: file.file_name,
    fps: typeof attributes.fps === "number" ? attributes.fps : void 0,
    hearingImpaired: attributes.hearing_impaired,
    downloadCount: attributes.download_count
  };
}
async function searchOnlineSubtitles(media, episode, language = "pt-br") {
  const queryCandidate = media.customTitle || media.title || "";
  const cleaned = cleanSearchTitle(queryCandidate);
  const baseParams = new URLSearchParams({
    languages: normalizeLanguage(language),
    type: media.kind === "series" ? "episode" : "movie"
  });
  if (media.kind === "series") {
    baseParams.set("season_number", String(episode.seasonNumber));
    baseParams.set("episode_number", String(episode.episodeNumber));
  }
  const searches = [];
  if (media.tmdbId) {
    const byTmdb = new URLSearchParams(baseParams);
    byTmdb.set("tmdb_id", String(media.tmdbId));
    searches.push(byTmdb);
  }
  const byTitle = new URLSearchParams(baseParams);
  if (cleaned || queryCandidate) byTitle.set("query", cleaned || queryCandidate);
  if (media.year) byTitle.set("year", String(media.year));
  searches.push(byTitle);
  if (media.year) {
    const byTitleWithoutYear = new URLSearchParams(byTitle);
    byTitleWithoutYear.delete("year");
    searches.push(byTitleWithoutYear);
  }
  for (const params of searches) {
    const response = await requestOpenSubtitles(`/subtitles?${params.toString()}`);
    const options = (response.data || []).map(resultToOption).filter((option) => !!option).slice(0, 20);
    if (options.length > 0) return options;
  }
  return [];
}
async function downloadBytes(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS2) });
  if (!response.ok) throw new Error(`Download da legenda falhou com HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > 20 * 1024 * 1024) {
    throw new Error("O arquivo de legenda baixado possui tamanho inv\xE1lido.");
  }
  return bytes;
}
async function downloadOnlineSubtitle(media, episode, option) {
  const response = await requestOpenSubtitles("/download", {
    method: "POST",
    body: JSON.stringify({
      file_id: option.fileId,
      sub_format: "srt",
      file_name: option.fileName || `${media.title}.srt`
    })
  }, true);
  if (!response.link) throw new Error(response.message || "OpenSubtitles n\xE3o retornou um link de download.");
  const content = await downloadBytes(response.link);
  const hash = import_crypto3.default.createHash("sha1").update(String(option.fileId)).digest("hex").slice(0, 12);
  const directory = import_path5.default.join(getDataDir(), "subtitles", media.id, episode.id);
  const baseName = safeFileName(import_path5.default.basename(response.file_name || option.fileName || `opensubtitles-${hash}.srt`, import_path5.default.extname(response.file_name || option.fileName || ".srt")));
  const targetPath = import_path5.default.join(directory, `${baseName || `opensubtitles-${hash}`}.${import_path5.default.extname(response.file_name || option.fileName || ".srt").replace(".", "") || "srt"}`);
  import_fs5.default.mkdirSync(directory, { recursive: true });
  import_fs5.default.writeFileSync(targetPath, content);
  const nextIndex = Math.max(99, ...episode.subtitleTracks.map((track) => track.index)) + 1;
  return {
    index: nextIndex,
    streamIndex: -1,
    codec: "srt",
    language: normalizeLanguage(option.language),
    title: `OpenSubtitles${option.release ? ` \xB7 ${option.release}` : ""}`,
    isExternal: true,
    isImported: true,
    source: "opensubtitles",
    filePath: targetPath
  };
}

// src/server/hls.ts
var import_fs6 = __toESM(require("fs"), 1);
var import_path6 = __toESM(require("path"), 1);
var import_os = __toESM(require("os"), 1);
var import_child_process2 = require("child_process");
var activeSessions = /* @__PURE__ */ new Map();
var inFlightSessions = /* @__PURE__ */ new Map();
function resolveHlsBaseDir() {
  const configuredDirectory = process.env.HLS_CACHE_DIR?.trim();
  const preferredDirectory = configuredDirectory ? import_path6.default.resolve(configuredDirectory) : import_path6.default.join(process.cwd(), ".cache", "hls");
  try {
    import_fs6.default.mkdirSync(preferredDirectory, { recursive: true });
    return preferredDirectory;
  } catch (error) {
    const fallbackDirectory = import_path6.default.join(import_os.default.tmpdir(), "cinelocal_hls");
    try {
      import_fs6.default.mkdirSync(fallbackDirectory, { recursive: true });
      console.warn(
        `[HLS] N\xE3o foi poss\xEDvel usar o cache configurado em ${preferredDirectory}. Usando o tempor\xE1rio do sistema: ${fallbackDirectory}. ${error?.message || ""}`
      );
    } catch {
    }
    return fallbackDirectory;
  }
}
var HLS_BASE_DIR = resolveHlsBaseDir();
var HLS_SESSION_IDLE_MS = 15 * 60 * 1e3;
var configuredCacheLimitMb = Number(process.env.HLS_CACHE_MAX_MB);
var HLS_CACHE_LIMIT_BYTES = Number.isFinite(configuredCacheLimitMb) && configuredCacheLimitMb > 0 ? configuredCacheLimitMb * 1024 * 1024 : 4 * 1024 * 1024 * 1024;
function getDirectorySize(directory) {
  let total = 0;
  try {
    for (const entry of import_fs6.default.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = import_path6.default.join(directory, entry.name);
      if (entry.isDirectory()) {
        total += getDirectorySize(entryPath);
      } else if (entry.isFile()) {
        total += import_fs6.default.statSync(entryPath).size;
      }
    }
  } catch {
  }
  return total;
}
function removeOrphanedCacheSessions() {
  try {
    for (const entry of import_fs6.default.readdirSync(HLS_BASE_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      import_fs6.default.rmSync(import_path6.default.join(HLS_BASE_DIR, entry.name), { recursive: true, force: true });
    }
  } catch (error) {
    console.warn(`[HLS] N\xE3o foi poss\xEDvel limpar sess\xF5es antigas: ${error?.message || error}`);
  }
}
function enforceCacheLimit() {
  let entries = [];
  try {
    entries = import_fs6.default.readdirSync(HLS_BASE_DIR, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => {
      const directory = import_path6.default.join(HLS_BASE_DIR, entry.name);
      let modifiedAt = 0;
      try {
        modifiedAt = import_fs6.default.statSync(directory).mtimeMs;
      } catch {
      }
      return { directory, size: getDirectorySize(directory), modifiedAt };
    }).sort((a, b) => a.modifiedAt - b.modifiedAt);
  } catch {
    return;
  }
  let totalSize = entries.reduce((total, entry) => total + entry.size, 0);
  if (totalSize <= HLS_CACHE_LIMIT_BYTES) return;
  const activeDirectories = new Set(
    Array.from(activeSessions.values()).map((session) => import_path6.default.resolve(session.sessionDir))
  );
  for (const entry of entries) {
    if (totalSize <= HLS_CACHE_LIMIT_BYTES) break;
    if (activeDirectories.has(import_path6.default.resolve(entry.directory))) continue;
    try {
      import_fs6.default.rmSync(entry.directory, { recursive: true, force: true });
      totalSize -= entry.size;
    } catch {
    }
  }
}
removeOrphanedCacheSessions();
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (now - session.lastAccess > HLS_SESSION_IDLE_MS) {
      cleanupSession(id);
    }
  }
  enforceCacheLimit();
}, 5 * 60 * 1e3);
function cleanupSession(sessionId) {
  const session = activeSessions.get(sessionId);
  if (!session) return;
  if (session.process && !session.process.killed) {
    try {
      session.process.kill("SIGKILL");
    } catch {
    }
  }
  activeSessions.delete(sessionId);
  try {
    if (import_fs6.default.existsSync(session.sessionDir)) {
      import_fs6.default.rmSync(session.sessionDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn(`[HLS] Error removing directory for session ${sessionId}:`, err);
  }
}
function findActiveSession(mediaId, episodeId, audioTrackIndex, transcoded = false, startSeconds = 0) {
  if (audioTrackIndex !== void 0) {
    const key = `${mediaId}_${episodeId}_a${audioTrackIndex}_s${Math.floor(startSeconds)}${transcoded ? "_t" : ""}`;
    const s = activeSessions.get(key);
    if (s) {
      s.lastAccess = Date.now();
      return s;
    }
    return void 0;
  }
  for (const session of activeSessions.values()) {
    if (session.mediaId === mediaId && session.episodeId === episodeId && session.transcoded === transcoded && Math.floor(session.startSeconds) === Math.floor(startSeconds)) {
      session.lastAccess = Date.now();
      return session;
    }
  }
  return void 0;
}
function spawnFfmpegHls(ffmpegBin, filePath, manifestPath, sessionDir, audioStreamIndex, canCopy, startSeconds = 0, preferHardware = true) {
  const args = [
    // This is a local file, not a live input. `nobuffer` disables the demuxer
    // reordering/buffering that MKV/H.264 needs and can produce uneven PTS.
    "-fflags",
    "+genpts+discardcorrupt+igndts",
    "-err_detect",
    "ignore_err",
    "-analyzeduration",
    "20M",
    "-probesize",
    "20M"
  ];
  if (startSeconds > 0) {
    args.push("-ss", startSeconds.toString());
  }
  const videoEncodingPlan = getVideoEncodingPlan(preferHardware);
  if (!canCopy && videoEncodingPlan.hardware) {
    args.push(...videoEncodingPlan.inputArgs);
  }
  args.push("-i", filePath, "-map", "0:V:0?");
  if (audioStreamIndex !== void 0) {
    args.push("-map", `0:${audioStreamIndex}?`);
  } else {
    args.push("-map", "0:a:0?");
  }
  if (canCopy) {
    args.push(
      "-c:v",
      "copy",
      "-bsf:v",
      "h264_mp4toannexb"
    );
  } else {
    args.push(...videoEncodingPlan.outputArgs, "-g", "60", "-keyint_min", "30", "-sc_threshold", "0", "-threads", "0");
  }
  args.push(
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ac",
    "2",
    "-af",
    "aresample=async=1000:min_hard_comp=0.100000:first_pts=0",
    "-avoid_negative_ts",
    "make_zero",
    "-f",
    "hls",
    "-hls_time",
    "4",
    "-hls_list_size",
    "0",
    "-hls_playlist_type",
    "event",
    // Never expose a playlist/segment while FFmpeg is still writing it.
    "-hls_flags",
    "independent_segments+temp_file",
    "-hls_segment_type",
    "mpegts",
    "-hls_segment_filename",
    import_path6.default.join(sessionDir, "segment_%04d.ts"),
    manifestPath
  );
  const proc = (0, import_child_process2.spawn)(ffmpegBin, args, { stdio: ["ignore", "ignore", "pipe"] });
  proc.on("error", (err) => {
    console.error(`[HLS Server Error] FFmpeg spawn error (${ffmpegBin}):`, err);
  });
  return proc;
}
async function getOrCreateHlsSession(mediaId, episodeId, filePath, audioStreamIndex, audioTrackIndex = 0, canDirectCopyVideo = false, forceTranscode = false, startSeconds = 0) {
  const transcoded = forceTranscode || !canDirectCopyVideo;
  const sessionId = `${mediaId}_${episodeId}_a${audioTrackIndex}_s${Math.floor(startSeconds)}${transcoded ? "_t" : ""}`;
  const existing = activeSessions.get(sessionId);
  if (existing && import_fs6.default.existsSync(existing.manifestPath)) {
    existing.lastAccess = Date.now();
    return {
      sessionId,
      manifestPath: existing.manifestPath,
      sessionDir: existing.sessionDir
    };
  }
  if (inFlightSessions.has(sessionId)) {
    return inFlightSessions.get(sessionId);
  }
  const sessionPromise = (async () => {
    const sessionDir = import_path6.default.join(HLS_BASE_DIR, sessionId);
    if (import_fs6.default.existsSync(sessionDir)) {
      try {
        import_fs6.default.rmSync(sessionDir, { recursive: true, force: true });
      } catch {
      }
    }
    try {
      import_fs6.default.mkdirSync(sessionDir, { recursive: true });
    } catch {
    }
    const manifestPath = import_path6.default.join(sessionDir, "master.m3u8");
    const { ffmpeg } = getBinaries();
    if (!ffmpeg) {
      throw new Error(
        'FFmpeg n\xE3o encontrado no computador. Para reproduzir arquivos MKV ou transcodificar \xE1udio, instale o FFmpeg ou coloque o execut\xE1vel ffmpeg.exe na pasta "bin" do CineLocal.'
      );
    }
    let proc;
    let stderrTail = "";
    let hasExited = false;
    let exitCode = null;
    let spawnError = null;
    const copyVideo = canDirectCopyVideo && !forceTranscode;
    try {
      const hardwareAttempt2 = !copyVideo && getHardwareAccelerationStatus().mode === "auto" && !!getHardwareAccelerationStatus().encoder;
      proc = spawnFfmpegHls(ffmpeg, filePath, manifestPath, sessionDir, audioStreamIndex, copyVideo, startSeconds, hardwareAttempt2);
      proc.__cinelocalHardwareAttempt = hardwareAttempt2;
    } catch (err) {
      throw new Error(`Erro ao iniciar processo FFmpeg: ${err.message}`);
    }
    proc.on("error", (err) => {
      spawnError = err;
      console.error(`[HLS] Process error for session ${sessionId}:`, err);
    });
    proc.stderr?.on("data", (chunk) => {
      const text = chunk.toString();
      stderrTail = (stderrTail + text).slice(-2e3);
    });
    proc.on("close", (code) => {
      hasExited = true;
      exitCode = code;
      if (code !== 0 && code !== null && !proc.killed) {
        console.warn(`[HLS Server Warning] FFmpeg finalizou com c\xF3digo ${code}. Stderr:
${stderrTail.trim()}`);
      }
    });
    const startTime = Date.now();
    let manifestReady = false;
    while (Date.now() - startTime < 8e3) {
      if (spawnError) break;
      if (import_fs6.default.existsSync(manifestPath)) {
        try {
          const content = import_fs6.default.readFileSync(manifestPath, "utf8");
          if (content.includes("#EXTM3U")) {
            manifestReady = true;
            break;
          }
        } catch {
        }
      }
      if (hasExited && exitCode !== 0) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    const hardwareAttempt = Boolean(proc.__cinelocalHardwareAttempt);
    if ((!manifestReady || hasExited && exitCode !== 0) && (copyVideo || hardwareAttempt)) {
      console.warn(`[HLS] ${hardwareAttempt ? "Hardware/transcode" : "Remux"} failed, attempting software fallback...`);
      try {
        proc.kill("SIGKILL");
      } catch {
      }
      stderrTail = "";
      hasExited = false;
      exitCode = null;
      spawnError = null;
      try {
        proc = spawnFfmpegHls(ffmpeg, filePath, manifestPath, sessionDir, audioStreamIndex, false, startSeconds, false);
        proc.on("error", (err) => {
          spawnError = err;
          console.error(`[HLS Fallback] Process error for session ${sessionId}:`, err);
        });
        proc.stderr?.on("data", (chunk) => {
          stderrTail = (stderrTail + chunk.toString()).slice(-1500);
        });
        proc.on("close", (code) => {
          hasExited = true;
          exitCode = code;
        });
        const fallbackStart = Date.now();
        while (Date.now() - fallbackStart < 8e3) {
          if (spawnError) break;
          if (import_fs6.default.existsSync(manifestPath)) {
            try {
              const content = import_fs6.default.readFileSync(manifestPath, "utf8");
              if (content.includes("#EXTM3U")) {
                manifestReady = true;
                break;
              }
            } catch {
            }
          }
          if (hasExited && exitCode !== 0) break;
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      } catch (fallbackErr) {
        console.error("[HLS Fallback] Failed to spawn fallback transcode:", fallbackErr);
      }
    }
    if (!import_fs6.default.existsSync(manifestPath)) {
      if (spawnError) {
        throw new Error(`Erro ao executar o FFmpeg (${spawnError.message || "ENOENT"}). Verifique o execut\xE1vel do FFmpeg.`);
      }
      throw new Error(`Falha ao gerar o fluxo HLS: ${stderrTail.slice(-400) || "FFmpeg encerrou sem gerar arquivo de streaming."}`);
    }
    const session = {
      sessionId,
      mediaId,
      episodeId,
      audioIndex: audioTrackIndex,
      startSeconds,
      transcoded,
      sessionDir,
      manifestPath,
      process: proc,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      isComplete: hasExited && exitCode === 0
    };
    proc.on("close", (code) => {
      if (code === 0) {
        session.isComplete = true;
      }
    });
    activeSessions.set(sessionId, session);
    return {
      sessionId,
      manifestPath,
      sessionDir
    };
  })();
  inFlightSessions.set(sessionId, sessionPromise);
  try {
    const res = await sessionPromise;
    return res;
  } finally {
    inFlightSessions.delete(sessionId);
  }
}

// src/server/torrent.ts
var import_fs7 = __toESM(require("fs"), 1);
var import_path7 = __toESM(require("path"), 1);
var import_torrent_stream = __toESM(require("torrent-stream"), 1);
var TORRENT_CACHE_DIR = import_path7.default.join(getDataDir(), "torrent-cache");
var TORRENT_HISTORY_FILE = import_path7.default.join(getDataDir(), "torrent-history.json");
if (!import_fs7.default.existsSync(TORRENT_CACHE_DIR)) {
  try {
    import_fs7.default.mkdirSync(TORRENT_CACHE_DIR, { recursive: true });
  } catch (err) {
    console.error("Erro ao criar pasta de cache do torrent:", err);
  }
}
var DEFAULT_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://tracker.openbittorrent.com:6969/announce",
  "udp://9.rarbg.to:2920/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://explodie.org:6969/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.tiny-vps.com:6969/announce",
  "udp://tracker.moeking.me:6969/announce",
  "udp://p4p.arenabg.com:1337/announce",
  "http://tracker.openbittorrent.com:80/announce",
  "udp://tracker.internetwarriors.net:1337/announce"
];
var VIDEO_EXTENSIONS2 = /* @__PURE__ */ new Set([".mp4", ".mkv", ".avi", ".webm", ".mov", ".m4v", ".wmv", ".flv", ".ts"]);
var SUBTITLE_EXTENSIONS2 = /* @__PURE__ */ new Set([".srt", ".vtt", ".ass", ".ssa"]);
var activeEngines = /* @__PURE__ */ new Map();
function parseInfoHash(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/xt=urn:btih:([a-zA-Z0-9]+)/i);
  if (match && match[1]) {
    return match[1].toLowerCase();
  }
  if (/^[a-fA-F0-9]{40}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^[a-zA-Z2-7]{32}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return trimmed.toLowerCase();
}
function parseTorrentName(magnetUri) {
  const match = magnetUri.match(/dn=([^&]+)/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1].replace(/\+/g, " "));
    } catch {
      return match[1];
    }
  }
  return void 0;
}
function readTorrentHistory() {
  try {
    if (import_fs7.default.existsSync(TORRENT_HISTORY_FILE)) {
      const content = import_fs7.default.readFileSync(TORRENT_HISTORY_FILE, "utf-8");
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error("Erro ao ler torrent-history.json:", err);
  }
  return [];
}
function saveTorrentHistoryItem(item) {
  try {
    const list = readTorrentHistory();
    const existingIndex = list.findIndex((i) => i.infoHash.toLowerCase() === item.infoHash.toLowerCase());
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...item,
        lastWatchedAt: now
      };
    } else {
      list.unshift({
        infoHash: item.infoHash.toLowerCase(),
        magnetUri: item.magnetUri,
        name: item.name || "Torrent",
        dateAdded: now,
        lastWatchedAt: now,
        progressSeconds: item.progressSeconds || 0,
        durationSeconds: item.durationSeconds || 0,
        selectedFileIndex: item.selectedFileIndex || 0,
        totalBytes: item.totalBytes || 0
      });
    }
    const trimmed = list.slice(0, 50);
    import_fs7.default.writeFileSync(TORRENT_HISTORY_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar torrent-history.json:", err);
  }
}
function removeTorrentHistoryItem(infoHash) {
  try {
    const list = readTorrentHistory().filter((i) => i.infoHash.toLowerCase() !== infoHash.toLowerCase());
    import_fs7.default.writeFileSync(TORRENT_HISTORY_FILE, JSON.stringify(list, null, 2), "utf-8");
    removeTorrentFromLibrary(infoHash);
  } catch (err) {
    console.error("Erro ao remover item do hist\xF3rico:", err);
  }
}
function syncExistingTorrentHistoryToLibrary() {
  try {
    const library = readLibrary();
    const history = readTorrentHistory();
    for (const item of history) {
      if (!item.infoHash || !item.progressSeconds) continue;
      const cleanHash = item.infoHash.toLowerCase();
      const existsInLibrary = library.items.some(
        (i) => i.infoHash && i.infoHash.toLowerCase() === cleanHash || i.id === `torrent_${cleanHash}`
      );
      if (existsInLibrary) {
        updateTorrentProgressInLibrary(
          item.infoHash,
          item.selectedFileIndex || 0,
          item.progressSeconds,
          item.durationSeconds
        );
      }
    }
  } catch (err) {
    console.error("Erro ao sincronizar hist\xF3rico de torrents:", err);
  }
}
syncExistingTorrentHistoryToLibrary();
function getOrCreateTorrentEngine(magnetUriOrHash) {
  const infoHash = parseInfoHash(magnetUriOrHash);
  let magnetUri = magnetUriOrHash.trim();
  if (!magnetUri.startsWith("magnet:?")) {
    magnetUri = `magnet:?xt=urn:btih:${infoHash}`;
  }
  const existing = activeEngines.get(infoHash);
  if (existing) {
    existing.lastAccessAt = Date.now();
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    const initialName = parseTorrentName(magnetUri) || `Torrent_${infoHash.slice(0, 8)}`;
    const torrentPath = import_path7.default.join(TORRENT_CACHE_DIR, infoHash);
    try {
      saveTorrentMediaItem({
        infoHash,
        magnetUri,
        name: initialName
      });
    } catch (e) {
      console.error("Erro ao salvar torrent preliminar na biblioteca:", e);
    }
    const record = {
      engine: null,
      infoHash,
      magnetUri,
      name: initialName,
      state: "connecting",
      totalBytes: 0,
      files: [],
      selectedFileIndex: 0,
      createdAt: Date.now(),
      lastAccessAt: Date.now()
    };
    activeEngines.set(infoHash, record);
    try {
      const engine = (0, import_torrent_stream.default)(magnetUri, {
        path: torrentPath,
        tmp: TORRENT_CACHE_DIR,
        trackers: DEFAULT_TRACKERS,
        verify: true,
        dht: true
      });
      record.engine = engine;
      const metaTimer = setTimeout(() => {
        if (record.state === "connecting") {
          record.state = "metadata";
        }
      }, 3e3);
      engine.on("ready", () => {
        clearTimeout(metaTimer);
        record.state = "ready";
        record.name = engine.torrent?.name || record.name;
        record.files = engine.files || [];
        record.totalBytes = engine.torrent?.length || engine.files.reduce((acc, f) => acc + (f.length || 0), 0);
        let bestVideoIdx = -1;
        let maxLen = 0;
        record.files.forEach((file, idx) => {
          const ext = import_path7.default.extname(file.name).toLowerCase();
          if (VIDEO_EXTENSIONS2.has(ext)) {
            if (file.length > maxLen) {
              maxLen = file.length;
              bestVideoIdx = idx;
            }
          }
        });
        if (bestVideoIdx >= 0) {
          record.selectedFileIndex = bestVideoIdx;
          try {
            record.files[bestVideoIdx].select();
          } catch {
          }
        }
        saveTorrentHistoryItem({
          infoHash: record.infoHash,
          magnetUri: record.magnetUri,
          name: record.name,
          totalBytes: record.totalBytes,
          selectedFileIndex: record.selectedFileIndex
        });
        try {
          const savedItem = saveTorrentMediaItem({
            infoHash: record.infoHash,
            magnetUri: record.magnetUri,
            name: record.name,
            files: record.files.map((f, idx) => ({
              name: f.name,
              path: f.path,
              length: f.length,
              index: idx
            })),
            totalBytes: record.totalBytes,
            selectedFileIndex: record.selectedFileIndex
          });
          if (isTmdbConfigured()) {
            enrichMediaWithTmdb(savedItem).then((enriched) => {
              const lib = readLibrary();
              const idx = lib.items.findIndex((i) => i.id === enriched.id);
              if (idx >= 0) {
                lib.items[idx] = enriched;
                writeLibrary(lib, true);
              }
            }).catch(() => {
            });
          }
        } catch (e) {
          console.error("Erro ao atualizar torrent na biblioteca:", e);
        }
        resolve(record);
      });
      engine.on("download", () => {
        if (record.state === "ready") {
          record.state = "downloading";
        }
      });
      engine.on("error", (err) => {
        console.error(`[Torrent Engine Error ${infoHash}]:`, err);
        record.state = "error";
        record.errorMessage = String(err?.message || err);
      });
      engine.on("idle", () => {
      });
      setTimeout(() => {
        resolve(record);
      }, 500);
    } catch (err) {
      console.error("Erro ao instanciar torrentStream:", err);
      record.state = "error";
      record.errorMessage = String(err?.message || err);
      resolve(record);
    }
  });
}
function getTorrentStatus(infoHash) {
  const normalizedHash = parseInfoHash(infoHash);
  const record = activeEngines.get(normalizedHash);
  if (!record) {
    const historyItem = readTorrentHistory().find((h) => h.infoHash.toLowerCase() === normalizedHash);
    return {
      infoHash: normalizedHash,
      name: historyItem?.name || "Torrent",
      state: "connecting",
      totalBytes: historyItem?.totalBytes || 0,
      downloadedBytes: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      peers: 0,
      progress: 0,
      selectedFileIndex: historyItem?.selectedFileIndex || 0,
      files: [],
      errorMessage: "Torrent inativo. Clique para conectar."
    };
  }
  record.lastAccessAt = Date.now();
  const engine = record.engine;
  const swarm = engine?.swarm;
  const downloadedBytes = swarm?.downloaded || 0;
  const downloadSpeed = swarm?.downloadSpeed?.() || 0;
  const uploadSpeed = swarm?.uploadSpeed?.() || 0;
  const peers = swarm?.wires?.length || 0;
  const totalBytes = record.totalBytes || 1;
  const progress = Math.min(100, Math.round(downloadedBytes / totalBytes * 1e3) / 10);
  const fileItems = (record.files || []).map((file, index) => {
    const ext = import_path7.default.extname(file.name).toLowerCase();
    return {
      index,
      name: file.name,
      path: file.path,
      length: file.length || 0,
      isVideo: VIDEO_EXTENSIONS2.has(ext),
      isSubtitle: SUBTITLE_EXTENSIONS2.has(ext),
      extension: ext
    };
  });
  return {
    infoHash: record.infoHash,
    magnetUri: record.magnetUri,
    name: record.name,
    state: record.state,
    totalBytes: record.totalBytes,
    downloadedBytes,
    downloadSpeed,
    uploadSpeed,
    peers,
    progress,
    selectedFileIndex: record.selectedFileIndex,
    files: fileItems,
    errorMessage: record.errorMessage
  };
}
function getTorrentFile(infoHash, fileIndex) {
  const normalizedHash = parseInfoHash(infoHash);
  const record = activeEngines.get(normalizedHash);
  if (!record || !record.files || !record.files[fileIndex]) {
    return null;
  }
  record.lastAccessAt = Date.now();
  record.selectedFileIndex = fileIndex;
  return record.files[fileIndex];
}
function selectTorrentFile(infoHash, fileIndex) {
  const normalizedHash = parseInfoHash(infoHash);
  const record = activeEngines.get(normalizedHash);
  if (!record || !record.files || !record.files[fileIndex]) {
    return false;
  }
  record.selectedFileIndex = fileIndex;
  try {
    record.files.forEach((f, i) => {
      if (i === fileIndex) {
        f.select();
      } else {
        try {
          f.deselect();
        } catch {
        }
      }
    });
  } catch {
  }
  return true;
}
function stopTorrent(infoHash, deleteData = false) {
  const normalizedHash = parseInfoHash(infoHash);
  const record = activeEngines.get(normalizedHash);
  if (!record) return Promise.resolve(false);
  return new Promise((resolve) => {
    try {
      if (record.engine) {
        record.engine.destroy(() => {
          activeEngines.delete(normalizedHash);
          if (deleteData) {
            const torrentPath = import_path7.default.join(TORRENT_CACHE_DIR, normalizedHash);
            try {
              if (import_fs7.default.existsSync(torrentPath)) {
                import_fs7.default.rmSync(torrentPath, { recursive: true, force: true });
              }
            } catch {
            }
          }
          resolve(true);
        });
      } else {
        activeEngines.delete(normalizedHash);
        resolve(true);
      }
    } catch (err) {
      console.error(`Erro ao parar torrent ${infoHash}:`, err);
      activeEngines.delete(normalizedHash);
      resolve(false);
    }
  });
}

// src/server/iptv.ts
var import_fs8 = __toESM(require("fs"), 1);
var import_path8 = __toESM(require("path"), 1);
var DEFAULT_PLAYLIST_URL = "https://iptv-org.github.io/iptv/index.m3u";
var playlistCache = {};
function getCacheFilePath() {
  return import_path8.default.join(getDataDir(), "iptv_cache.json");
}
function loadIptvCacheFromDisk() {
  try {
    const file = getCacheFilePath();
    if (import_fs8.default.existsSync(file)) {
      const content = import_fs8.default.readFileSync(file, "utf-8");
      playlistCache = JSON.parse(content);
    }
  } catch (err) {
    console.error("Erro ao ler cache IPTV do disco:", err);
  }
}
function saveIptvCacheToDisk() {
  try {
    const file = getCacheFilePath();
    import_fs8.default.writeFileSync(file, JSON.stringify(playlistCache), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar cache IPTV:", err);
  }
}
function parseM3U(content, playlistUrl) {
  const lines = content.split(/\r?\n/);
  const channels = [];
  const categoriesSet = /* @__PURE__ */ new Set();
  const countriesSet = /* @__PURE__ */ new Set();
  let currentInfo = null;
  let currentExtraHeaders = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF:")) {
      currentInfo = {};
      currentExtraHeaders = {};
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/i);
      const tvgCountryMatch = line.match(/tvg-country="([^"]*)"/i);
      const tvgLangMatch = line.match(/tvg-language="([^"]*)"/i);
      const userAgentMatch = line.match(/http-user-agent="([^"]*)"/i);
      const referrerMatch = line.match(/http-referrer="([^"]*)"/i);
      const commaIndex = line.lastIndexOf(",");
      let rawTitle = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : "";
      if (!rawTitle && tvgNameMatch) {
        rawTitle = tvgNameMatch[1];
      }
      let resolution = "";
      const resMatch = rawTitle.match(/\b(4k|2160p|1080p|720p|576p|480p|360p|240p|fhd|hd|sd)\b/i);
      if (resMatch) {
        resolution = resMatch[1].toUpperCase();
      }
      let country = tvgCountryMatch ? tvgCountryMatch[1].toUpperCase() : "";
      if (!country && tvgIdMatch) {
        const idCountryMatch = tvgIdMatch[1].match(/\.([a-z]{2})(@|$)/i);
        if (idCountryMatch) {
          country = idCountryMatch[1].toUpperCase();
        }
      }
      let group = groupTitleMatch ? groupTitleMatch[1].trim() : "Geral";
      if (!group || group.toLowerCase() === "undefined") {
        group = "Geral";
      }
      if (group.includes(";")) {
        const primaryGroup = group.split(";")[0].trim();
        group = primaryGroup || group;
      }
      if (group) categoriesSet.add(group);
      if (country) countriesSet.add(country);
      currentInfo = {
        name: rawTitle || tvgNameMatch?.[1] || "Canal Desconhecido",
        logo: tvgLogoMatch ? tvgLogoMatch[1] : void 0,
        group,
        country: country || void 0,
        language: tvgLangMatch ? tvgLangMatch[1] : void 0,
        tvgId: tvgIdMatch ? tvgIdMatch[1] : void 0,
        resolution: resolution || void 0,
        httpUserAgent: userAgentMatch ? userAgentMatch[1] : void 0,
        httpReferrer: referrerMatch ? referrerMatch[1] : void 0
      };
    } else if (line.startsWith("#EXTVLCOPT:http-user-agent=")) {
      currentExtraHeaders.userAgent = line.substring(line.indexOf("=") + 1).trim();
    } else if (line.startsWith("#EXTVLCOPT:http-referrer=")) {
      currentExtraHeaders.referrer = line.substring(line.indexOf("=") + 1).trim();
    } else if (line.startsWith("#")) {
      continue;
    } else if (line.startsWith("http://") || line.startsWith("https://") || line.startsWith("rtmp://") || line.startsWith("mms://")) {
      if (currentInfo) {
        const channelId = `ch_${channels.length + 1}_${Math.random().toString(36).substring(2, 7)}`;
        channels.push({
          id: channelId,
          name: currentInfo.name || `Canal ${channels.length + 1}`,
          logo: currentInfo.logo,
          group: currentInfo.group || "Geral",
          country: currentInfo.country,
          language: currentInfo.language,
          url: line,
          tvgId: currentInfo.tvgId,
          resolution: currentInfo.resolution,
          httpUserAgent: currentInfo.httpUserAgent || currentExtraHeaders.userAgent,
          httpReferrer: currentInfo.httpReferrer || currentExtraHeaders.referrer
        });
        currentInfo = null;
        currentExtraHeaders = {};
      }
    }
  }
  const sortedCategories = Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
  const sortedCountries = Array.from(countriesSet).sort((a, b) => a.localeCompare(b));
  return {
    url: playlistUrl,
    totalChannels: channels.length,
    categories: sortedCategories,
    countries: sortedCountries,
    channels,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function fetchIptvPlaylist(playlistUrl = DEFAULT_PLAYLIST_URL, forceRefresh = false) {
  const cached = playlistCache[playlistUrl];
  const ONE_HOUR = 60 * 60 * 1e3;
  if (!forceRefresh && cached && Date.now() - cached.timestamp < ONE_HOUR) {
    return cached.data;
  }
  console.log(`[IPTV] Baixando playlist de: ${playlistUrl}`);
  const response = await fetch(playlistUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "*/*"
    }
  });
  if (!response.ok) {
    throw new Error(`Falha ao obter playlist IPTV: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  const parsed = parseM3U(text, playlistUrl);
  playlistCache[playlistUrl] = {
    data: parsed,
    timestamp: Date.now()
  };
  saveIptvCacheToDisk();
  return parsed;
}
var IPTV_PRESETS = [
  {
    name: "IPTV Geral (Global - Completa)",
    url: "https://iptv-org.github.io/iptv/index.m3u",
    description: "Mais de 10.000 canais gratuitos do mundo todo"
  },
  {
    name: "Brasil \u{1F1E7}\u{1F1F7}",
    url: "https://iptv-org.github.io/iptv/countries/br.m3u",
    description: "Canais abertos e comunit\xE1rios do Brasil"
  },
  {
    name: "Portugal \u{1F1F5}\u{1F1F9}",
    url: "https://iptv-org.github.io/iptv/countries/pt.m3u",
    description: "Canais de Portugal"
  },
  {
    name: "Filmes e S\xE9ries \u{1F3AC}",
    url: "https://iptv-org.github.io/iptv/categories/movies.m3u",
    description: "Canais tem\xE1ticos de cinema e s\xE9ries"
  },
  {
    name: "Not\xEDcias \u{1F4F0}",
    url: "https://iptv-org.github.io/iptv/categories/news.m3u",
    description: "Canais globais de jornalismo e not\xEDcias"
  },
  {
    name: "Esportes \u26BD",
    url: "https://iptv-org.github.io/iptv/categories/sports.m3u",
    description: "Canais de transmiss\xE3o esportiva"
  },
  {
    name: "M\xFAsica \u{1F3B5}",
    url: "https://iptv-org.github.io/iptv/categories/music.m3u",
    description: "Videoclipes e shows 24/7"
  },
  {
    name: "Infantil / Anima\xE7\xE3o \u{1F9F8}",
    url: "https://iptv-org.github.io/iptv/categories/kids.m3u",
    description: "Desenhos e entretenimento para crian\xE7as"
  },
  {
    name: "Document\xE1rios & Cultura \u{1F30D}",
    url: "https://iptv-org.github.io/iptv/categories/documentary.m3u",
    description: "Hist\xF3ria, ci\xEAncia, natureza e viagens"
  }
];

// src/server/routes.ts
loadIptvCacheFromDisk();
var apiRouter = (0, import_express.Router)();
apiRouter.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
var IMPORTED_SUBTITLE_EXTENSIONS = /* @__PURE__ */ new Set([".srt", ".vtt", ".ass", ".ssa"]);
var MAX_IMPORTED_SUBTITLE_BYTES = 10 * 1024 * 1024;
function sanitizeSubtitleFileName(fileName, extension) {
  const baseName = import_path9.default.basename(fileName, import_path9.default.extname(fileName)).replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").replace(/\s+/g, " ").trim();
  return `${baseName || "legenda"}${extension}`;
}
function isPathInsideDirectory(filePath, directory) {
  const relative = import_path9.default.relative(import_path9.default.resolve(directory), import_path9.default.resolve(filePath));
  return relative !== "" && !relative.startsWith("..") && !import_path9.default.isAbsolute(relative);
}
apiRouter.get("/library", (req, res) => {
  const lib = readLibrary();
  res.json(lib);
});
apiRouter.post("/library/add", async (req, res) => {
  try {
    const { folderPath, title } = req.body;
    if (!folderPath) {
      res.status(400).json({ error: "Caminho da pasta \xE9 obrigat\xF3rio" });
      return;
    }
    const mediaItem = await scanMediaFolder(folderPath, title);
    await enrichMediaWithTmdb(mediaItem);
    const lib = readLibrary();
    const existingIndex = lib.items.findIndex(
      (item) => item.id === mediaItem.id || item.folderPath === mediaItem.folderPath
    );
    if (existingIndex >= 0) {
      const existing = lib.items[existingIndex];
      for (const newSeason of mediaItem.seasons) {
        const oldSeason = existing.seasons.find((s) => s.seasonNumber === newSeason.seasonNumber);
        if (oldSeason) {
          for (const newEp of newSeason.episodes) {
            const oldEp = oldSeason.episodes.find(
              (e) => e.fileName === newEp.fileName || e.episodeNumber === newEp.episodeNumber
            );
            if (oldEp) {
              newEp.watched = oldEp.watched;
              newEp.progressSeconds = oldEp.progressSeconds;
              newEp.lastWatchedAt = oldEp.lastWatchedAt;
              newEp.selectedAudioIndex = oldEp.selectedAudioIndex;
              newEp.selectedSubtitleIndex = oldEp.selectedSubtitleIndex;
              newEp.subtitleTracks = [
                ...newEp.subtitleTracks,
                ...oldEp.subtitleTracks.filter((track) => track.isImported)
              ];
            }
          }
        }
      }
      mediaItem.lastWatchedEpisodeId = existing.lastWatchedEpisodeId;
      mediaItem.lastWatchedAt = existing.lastWatchedAt;
      if (existing.backdropPath && !mediaItem.backdropPath) {
        mediaItem.backdropPath = existing.backdropPath;
      }
      if (existing.posterPath && !mediaItem.posterPath) {
        mediaItem.posterPath = existing.posterPath;
      }
      lib.items[existingIndex] = mediaItem;
    } else {
      lib.items.push(mediaItem);
    }
    writeLibrary(lib);
    res.json({ success: true, item: mediaItem });
  } catch (error) {
    console.error("Error adding folder:", error);
    res.status(400).json({ error: error.message || "Erro ao escanear pasta" });
  }
});
apiRouter.post("/library/rescan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const media = findMediaItem(id);
    if (!media) {
      res.status(404).json({ error: "M\xEDdia n\xE3o encontrada" });
      return;
    }
    const updatedItem = await scanMediaFolder(media.folderPath, media.customTitle);
    await enrichMediaWithTmdb(updatedItem);
    const lib = readLibrary();
    const idx = lib.items.findIndex((i) => i.id === id);
    for (const newSeason of updatedItem.seasons) {
      const oldSeason = media.seasons.find((s) => s.seasonNumber === newSeason.seasonNumber);
      if (oldSeason) {
        for (const newEp of newSeason.episodes) {
          const oldEp = oldSeason.episodes.find((e) => e.fileName === newEp.fileName);
          if (oldEp) {
            newEp.watched = oldEp.watched;
            newEp.progressSeconds = oldEp.progressSeconds;
            newEp.lastWatchedAt = oldEp.lastWatchedAt;
            newEp.subtitleTracks = [
              ...newEp.subtitleTracks,
              ...oldEp.subtitleTracks.filter((track) => track.isImported)
            ];
          }
        }
      }
    }
    updatedItem.lastWatchedEpisodeId = media.lastWatchedEpisodeId;
    updatedItem.lastWatchedAt = media.lastWatchedAt;
    updatedItem.customTitle = media.customTitle;
    updatedItem.tmdbId = updatedItem.tmdbId || media.tmdbId;
    updatedItem.metadataProvider = updatedItem.metadataProvider || media.metadataProvider;
    updatedItem.originalTitle = updatedItem.originalTitle || media.originalTitle;
    updatedItem.year = updatedItem.year || media.year;
    updatedItem.overview = updatedItem.overview || media.overview;
    updatedItem.tagline = updatedItem.tagline || media.tagline;
    updatedItem.genres = updatedItem.genres?.length ? updatedItem.genres : media.genres;
    updatedItem.rating = updatedItem.rating ?? media.rating;
    updatedItem.voteCount = updatedItem.voteCount ?? media.voteCount;
    updatedItem.cast = updatedItem.cast?.length ? updatedItem.cast : media.cast;
    if (media.backdropPath && !updatedItem.backdropPath) {
      updatedItem.backdropPath = media.backdropPath;
    }
    if (media.posterPath && !updatedItem.posterPath) {
      updatedItem.posterPath = media.posterPath;
    }
    lib.items[idx] = updatedItem;
    writeLibrary(lib);
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.all(["/library/rescan-all", "/library/rescan-folders"], async (_req, res) => {
  try {
    const result = await rescanAllLibraryFolders();
    res.json({ success: true, count: result.updatedCount, library: result.library });
  } catch (error) {
    console.error("Erro no re-scan de todas as pastas:", error);
    res.status(500).json({ error: error?.message || "Erro ao re-escanear pastas" });
  }
});
apiRouter.post("/library/metadata/:id", async (req, res) => {
  try {
    if (!isTmdbConfigured()) {
      res.status(503).json({ error: "TMDb n\xE3o configurado. Configure sua chave da API do TMDb no menu Status." });
      return;
    }
    const media = findMediaItem(req.params.id);
    if (!media) {
      res.status(404).json({ error: "M\xEDdia n\xE3o encontrada" });
      return;
    }
    const { query, tmdbId } = req.body || {};
    await enrichMediaWithTmdb(media, query, tmdbId ? Number(tmdbId) : void 0);
    const library = readLibrary();
    const index = library.items.findIndex((item) => item.id === media.id);
    if (index < 0) {
      res.status(404).json({ error: "M\xEDdia n\xE3o encontrada" });
      return;
    }
    library.items[index] = media;
    writeLibrary(library, true);
    res.json({ success: true, item: media });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Erro ao atualizar metadados" });
  }
});
apiRouter.post("/library/refresh-all-metadata", async (req, res) => {
  try {
    if (!isTmdbConfigured()) {
      res.status(503).json({ error: "TMDb n\xE3o configurado. Configure sua chave da API do TMDb." });
      return;
    }
    const library = readLibrary();
    let updatedCount = 0;
    for (let i = 0; i < library.items.length; i++) {
      const item = library.items[i];
      try {
        await enrichMediaWithTmdb(item);
        updatedCount++;
      } catch (err) {
        console.warn(`[TMDb] Erro ao atualizar item ${item.title}:`, err);
      }
    }
    writeLibrary(library, true);
    res.json({ success: true, updatedCount, total: library.items.length });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Erro ao atualizar metadados da biblioteca" });
  }
});
apiRouter.post("/library/relocate/:id", (req, res) => {
  const { id } = req.params;
  const { newFolderPath } = req.body;
  if (!newFolderPath) {
    res.status(400).json({ error: "Novo caminho da pasta \xE9 obrigat\xF3rio" });
    return;
  }
  const result = relocateMediaFolder(id, newFolderPath);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});
apiRouter.delete("/library/:id", (req, res) => {
  const { id } = req.params;
  const lib = readLibrary();
  lib.items = lib.items.filter((item) => item.id !== id);
  writeLibrary(lib);
  if (id.startsWith("torrent_")) {
    const cleanHash = id.replace("torrent_", "");
    try {
      removeTorrentHistoryItem(cleanHash);
      stopTorrent(cleanHash, true).catch(() => {
      });
    } catch {
    }
  }
  res.json({ success: true });
});
apiRouter.post("/library/progress", (req, res) => {
  const { mediaId, episodeId, progressSeconds, durationSeconds, completed, audioIndex, subtitleIndex } = req.body;
  if (!mediaId || !episodeId || progressSeconds === void 0) {
    res.status(400).json({ error: "Par\xE2metros insuficientes" });
    return;
  }
  const ok = updateEpisodeProgress(
    mediaId,
    episodeId,
    progressSeconds,
    durationSeconds,
    completed,
    audioIndex,
    subtitleIndex
  );
  res.json({ success: ok });
});
apiRouter.post("/library/mark-watched", (req, res) => {
  const { mediaId, episodeId, watched } = req.body;
  if (!mediaId || !episodeId) {
    res.status(400).json({ error: "mediaId e episodeId s\xE3o obrigat\xF3rios" });
    return;
  }
  const ok = toggleEpisodeWatched(mediaId, episodeId, watched);
  res.json({ success: ok });
});
apiRouter.get("/media/:mediaId/episode/:episodeId/stream", (req, res) => {
  const { mediaId, episodeId } = req.params;
  const pair = findEpisode(mediaId, episodeId);
  if (!pair) {
    res.status(404).send("Epis\xF3dio n\xE3o encontrado");
    return;
  }
  const { episode } = pair;
  const filePath = episode.filePath;
  if (!import_fs9.default.existsSync(filePath)) {
    res.status(404).send(`Arquivo n\xE3o encontrado no disco: ${filePath}`);
    return;
  }
  const audioTrackParam = req.query.audio;
  const seekParam = req.query.seek;
  const forceTranscode = req.query.transcode === "true" || req.query.transcode === "1";
  const audioTrackIndex = audioTrackParam !== void 0 ? parseInt(audioTrackParam, 10) : void 0;
  const seekSeconds = seekParam ? parseFloat(seekParam) : 0;
  const directCompatible = !forceTranscode && isBrowserNativeDirectPlayable(filePath, episode.videoCodec, episode.audioTracks[0]?.codec, episode.pixFmt) && (audioTrackIndex === void 0 || audioTrackIndex === 0);
  if (directCompatible && !seekParam) {
    const stat = import_fs9.default.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const mimeType = episode.extension === ".webm" ? "video/webm" : "video/mp4";
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": mimeType
      });
      const fileStream = import_fs9.default.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes"
      });
      import_fs9.default.createReadStream(filePath).pipe(res);
    }
    return;
  }
  const { ffmpeg } = getBinaries();
  if (!ffmpeg) {
    res.status(500).send("FFmpeg n\xE3o encontrado para transcodificar este formato");
    return;
  }
  const selectedAudio = audioTrackIndex !== void 0 && episode.audioTracks[audioTrackIndex] ? episode.audioTracks[audioTrackIndex] : episode.audioTracks[0];
  const audioStreamIndex = selectedAudio ? selectedAudio.streamIndex : void 0;
  const args = [];
  const videoEncodingPlan = getVideoEncodingPlan(true);
  args.push("-fflags", "+genpts+discardcorrupt+igndts");
  args.push("-err_detect", "ignore_err");
  if (videoEncodingPlan.hardware) {
    args.push(...videoEncodingPlan.inputArgs);
  }
  if (seekSeconds > 0) {
    args.push("-ss", seekSeconds.toString());
  }
  args.push("-i", filePath);
  args.push("-map", "0:V:0?");
  if (audioStreamIndex !== void 0) {
    args.push("-map", `0:${audioStreamIndex}`);
  } else {
    args.push("-map", "0:a:0?");
  }
  const isH264 = episode.videoCodec?.toLowerCase().includes("264") || episode.videoCodec?.toLowerCase().includes("avc");
  const is10BitOrHighColor = episode.pixFmt && (episode.pixFmt.includes("10") || episode.pixFmt.includes("444") || episode.pixFmt.includes("422"));
  const canDirectCopyVideo = !forceTranscode && isH264 && !is10BitOrHighColor;
  if (canDirectCopyVideo) {
    args.push(
      "-c:v",
      "copy",
      "-bsf:v",
      "dump_extra"
    );
  } else {
    args.push(...videoEncodingPlan.outputArgs);
  }
  args.push(
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ac",
    "2",
    "-af",
    "aresample=async=1000:min_hard_comp=0.100000:first_pts=0"
  );
  args.push(
    "-max_muxing_queue_size",
    "4096",
    "-avoid_negative_ts",
    "make_zero",
    "-movflags",
    "frag_keyframe+default_base_moof+negative_cts_offsets",
    "-f",
    "mp4",
    "pipe:1"
  );
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Connection": "keep-alive"
  });
  const proc = (0, import_child_process3.spawn)(ffmpeg, args);
  proc.stdout.pipe(res);
  let stderrTail = "";
  proc.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    stderrTail = (stderrTail + text).slice(-1e3);
  });
  proc.on("close", (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`[FFmpeg] Stream exited with code ${code}. Stderr snippet: ${stderrTail.trim()}`);
    }
  });
  proc.on("error", (err) => {
    console.error("FFmpeg streaming error:", err);
    if (!res.headersSent) {
      res.status(500).send("Erro no streaming ffmpeg");
    }
  });
  res.on("close", () => {
    try {
      proc.kill("SIGKILL");
    } catch {
    }
  });
});
apiRouter.get("/media/:mediaId/episode/:episodeId/hls/:file", async (req, res) => {
  const { mediaId, episodeId, file } = req.params;
  const audioTrackParam = req.query.audio;
  const parsedAudioTrack = audioTrackParam !== void 0 ? parseInt(audioTrackParam, 10) : 0;
  const audioTrackIndex = Number.isInteger(parsedAudioTrack) && parsedAudioTrack >= 0 ? parsedAudioTrack : 0;
  const seekParam = req.query.seek;
  const parsedSeek = seekParam !== void 0 ? parseFloat(seekParam) : 0;
  const seekSeconds = Number.isFinite(parsedSeek) && parsedSeek > 0 ? parsedSeek : 0;
  const castMode = req.query.cast === "true" || req.query.cast === "1";
  const forceTranscode = castMode || req.query.transcode === "true" || req.query.transcode === "1";
  const pair = findEpisode(mediaId, episodeId);
  if (!pair) {
    console.warn(`[HLS Route] Epis\xF3dio n\xE3o encontrado para mediaId=${mediaId}, epId=${episodeId}`);
    res.status(404).send("Epis\xF3dio n\xE3o encontrado");
    return;
  }
  const { episode } = pair;
  const filePath = episode.filePath;
  if (!import_fs9.default.existsSync(filePath)) {
    console.warn(`[HLS Route] Arquivo n\xE3o existe no disco: ${filePath}`);
    res.status(404).send(`Arquivo n\xE3o encontrado: ${filePath}`);
    return;
  }
  const selectedAudio = episode.audioTracks[audioTrackIndex] || episode.audioTracks[0];
  const audioStreamIndex = selectedAudio ? selectedAudio.streamIndex : void 0;
  const isH264 = !!(episode.videoCodec?.toLowerCase().includes("264") || episode.videoCodec?.toLowerCase().includes("avc"));
  const is10BitOrHighColor = !!(episode.pixFmt && (episode.pixFmt.includes("10") || episode.pixFmt.includes("444") || episode.pixFmt.includes("422")));
  const canDirectCopyVideo = Boolean(!forceTranscode && isH264 && !is10BitOrHighColor);
  const isTranscodedSession = forceTranscode || !canDirectCopyVideo;
  try {
    let sessionDir;
    let manifestPath;
    const existingSession = findActiveSession(
      mediaId,
      episodeId,
      audioTrackIndex,
      isTranscodedSession,
      seekSeconds
    );
    if (existingSession && import_fs9.default.existsSync(existingSession.manifestPath)) {
      existingSession.lastAccess = Date.now();
      sessionDir = existingSession.sessionDir;
      manifestPath = existingSession.manifestPath;
    } else {
      const created = await getOrCreateHlsSession(
        mediaId,
        episodeId,
        filePath,
        audioStreamIndex,
        audioTrackIndex,
        canDirectCopyVideo,
        forceTranscode,
        seekSeconds
      );
      sessionDir = created.sessionDir;
      manifestPath = created.manifestPath;
    }
    const targetFile = file === "master.m3u8" ? manifestPath : import_path9.default.join(sessionDir, file);
    if (!import_fs9.default.existsSync(targetFile)) {
      const startWait = Date.now();
      while (Date.now() - startWait < 25e3 && !import_fs9.default.existsSync(targetFile)) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!import_fs9.default.existsSync(targetFile)) {
        const availableFiles = import_fs9.default.existsSync(sessionDir) ? import_fs9.default.readdirSync(sessionDir).join(", ") : "dir_not_found";
        console.error(`[HLS Route ERROR] Segmento ${file} n\xE3o foi gerado em 25s. Arquivos: [${availableFiles}]`);
      }
    }
    if (!import_fs9.default.existsSync(targetFile)) {
      res.status(404).send("Segmento HLS n\xE3o encontrado");
      return;
    }
    if (file.endsWith(".m3u8")) {
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    } else if (file.endsWith(".ts")) {
      res.setHeader("Content-Type", "video/mp2t");
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
    if (file === "master.m3u8") {
      const segmentQuery = new URLSearchParams({ audio: String(audioTrackIndex) });
      if (seekSeconds > 0) segmentQuery.set("seek", String(seekSeconds));
      if (castMode) segmentQuery.set("cast", "1");
      if (forceTranscode) segmentQuery.set("transcode", "1");
      const manifest = import_fs9.default.readFileSync(targetFile, "utf8").replace(
        /^(segment_\d+\.ts)$/gm,
        `$1?${segmentQuery.toString()}`
      );
      res.setHeader("Content-Length", Buffer.byteLength(manifest, "utf8"));
      res.send(manifest);
      return;
    }
    res.sendFile(import_path9.default.resolve(targetFile), { dotfiles: "allow" }, (err) => {
      const clientAborted = req.destroyed || res.destroyed || ["ECONNABORTED", "ECONNRESET", "EPIPE"].includes(err?.code) || /request aborted|connection reset/i.test(err?.message || "");
      if (err && !clientAborted && !res.headersSent) {
        console.warn(`[HLS Route] Failed to send ${file}:`, err.message);
      }
    });
  } catch (err) {
    console.error("[HLS Route Exception]:", err);
    if (!res.headersSent) {
      res.status(500).send(`Erro ao preparar streaming HLS: ${err.message}`);
    }
  }
});
apiRouter.get("/media/:mediaId/episode/:episodeId/subtitles/online", async (req, res) => {
  const { mediaId, episodeId } = req.params;
  if (!isOpenSubtitlesConfigured()) {
    res.status(503).json({ error: "OpenSubtitles n\xE3o configurado. Defina OPENSUBTITLES_API_KEY." });
    return;
  }
  const pair = findEpisode(mediaId, episodeId);
  if (!pair) {
    res.status(404).json({ error: "Epis\xF3dio n\xE3o encontrado" });
    return;
  }
  try {
    const language = typeof req.query.language === "string" ? req.query.language : "pt-br";
    const items = await searchOnlineSubtitles(pair.media, pair.episode, language);
    res.json({ items });
  } catch (error) {
    res.status(502).json({ error: error?.message || "N\xE3o foi poss\xEDvel buscar legendas online." });
  }
});
apiRouter.post("/media/:mediaId/episode/:episodeId/subtitles/online/download", async (req, res) => {
  const { mediaId, episodeId } = req.params;
  const pair = findEpisode(mediaId, episodeId);
  if (!pair) {
    res.status(404).json({ error: "Epis\xF3dio n\xE3o encontrado" });
    return;
  }
  const fileId = Number(req.body?.fileId);
  if (!Number.isInteger(fileId) || fileId <= 0) {
    res.status(400).json({ error: "fileId de legenda inv\xE1lido." });
    return;
  }
  try {
    const option = {
      id: String(req.body?.id || fileId),
      fileId,
      language: typeof req.body?.language === "string" ? req.body.language : "pt-br",
      languageName: typeof req.body?.languageName === "string" ? req.body.languageName : void 0,
      release: typeof req.body?.release === "string" ? req.body.release : void 0,
      fileName: typeof req.body?.fileName === "string" ? req.body.fileName : void 0
    };
    const track = await downloadOnlineSubtitle(pair.media, pair.episode, option);
    pair.episode.subtitleTracks.push(track);
    writeLibrary(readLibrary(), true);
    res.json({ success: true, track });
  } catch (error) {
    res.status(502).json({ error: error?.message || "N\xE3o foi poss\xEDvel baixar a legenda online." });
  }
});
apiRouter.get("/media/:mediaId/episode/:episodeId/subtitles/:index", (req, res) => {
  const { mediaId, episodeId, index } = req.params;
  const parsedOffset = Number(req.query.offset);
  const offsetSeconds = Number.isFinite(parsedOffset) ? parsedOffset : 0;
  const pair = findEpisode(mediaId, episodeId);
  if (!pair) {
    res.status(404).send("Epis\xF3dio n\xE3o encontrado");
    return;
  }
  const trackIdx = parseInt(index, 10);
  const track = pair.episode.subtitleTracks.find((t) => t.index === trackIdx);
  if (!track) {
    res.status(404).send("Faixa de legenda n\xE3o encontrada");
    return;
  }
  if (track.isExternal && track.filePath && import_fs9.default.existsSync(track.filePath)) {
    const ext = import_path9.default.extname(track.filePath).toLowerCase();
    if (ext === ".vtt") {
      res.setHeader("Content-Type", "text/vtt; charset=utf-8");
      if (offsetSeconds === 0) {
        import_fs9.default.createReadStream(track.filePath).pipe(res);
      } else {
        const raw = import_fs9.default.readFileSync(track.filePath, "utf-8");
        res.send(shiftWebVttTimestamps(raw, offsetSeconds));
      }
      return;
    }
    if (ext === ".srt") {
      try {
        const raw = import_fs9.default.readFileSync(track.filePath, "utf-8");
        const vttContent = shiftWebVttTimestamps(
          "WEBVTT\n\n" + raw.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2"),
          offsetSeconds
        );
        res.setHeader("Content-Type", "text/vtt; charset=utf-8");
        res.send(vttContent);
        return;
      } catch {
      }
    }
    if (ext === ".ass" || ext === ".ssa") {
      streamSubtitlesToVtt(track.filePath, 0, res, offsetSeconds);
      return;
    }
  }
  if (!track.isExternal && isBitmapSubtitleCodec(track.codec)) {
    res.status(415).json({
      code: "BITMAP_SUBTITLE_UNSUPPORTED",
      error: "Esta faixa usa legenda gr\xE1fica (PGS/VobSub) e n\xE3o pode ser convertida diretamente para WebVTT.",
      suggestion: 'Use "Buscar online" para baixar uma legenda textual compat\xEDvel com Chromecast.'
    });
    return;
  }
  const streamIdx = track.streamIndex >= 0 ? track.streamIndex : 0;
  streamSubtitlesToVtt(pair.episode.filePath, streamIdx, res, offsetSeconds);
});
apiRouter.post("/media/:mediaId/episode/:episodeId/subtitles/import", (req, res) => {
  const { mediaId, episodeId } = req.params;
  const pair = findEpisode(mediaId, episodeId);
  if (!pair) {
    res.status(404).json({ error: "Epis\xF3dio n\xE3o encontrado" });
    return;
  }
  const fileName = typeof req.body?.fileName === "string" ? req.body.fileName : "";
  const contentBase64 = typeof req.body?.contentBase64 === "string" ? req.body.contentBase64 : "";
  const extension = import_path9.default.extname(fileName).toLowerCase();
  if (!fileName || !IMPORTED_SUBTITLE_EXTENSIONS.has(extension)) {
    res.status(400).json({ error: "Formato de legenda n\xE3o suportado. Use .srt, .vtt, .ass ou .ssa." });
    return;
  }
  if (!contentBase64) {
    res.status(400).json({ error: "O arquivo de legenda est\xE1 vazio." });
    return;
  }
  let content;
  try {
    content = Buffer.from(contentBase64, "base64");
  } catch {
    res.status(400).json({ error: "Conte\xFAdo de legenda inv\xE1lido." });
    return;
  }
  if (content.length === 0 || content.length > MAX_IMPORTED_SUBTITLE_BYTES) {
    res.status(400).json({ error: "A legenda deve ter entre 1 byte e 10 MB." });
    return;
  }
  const subtitleDirectory = import_path9.default.join(getDataDir(), "subtitles", mediaId, episodeId);
  const safeFileName2 = sanitizeSubtitleFileName(fileName, extension);
  const targetPath = import_path9.default.join(subtitleDirectory, safeFileName2);
  const normalizedTargetPath = import_path9.default.resolve(targetPath);
  const normalizedDirectory = import_path9.default.resolve(subtitleDirectory);
  if (!isPathInsideDirectory(normalizedTargetPath, normalizedDirectory)) {
    res.status(400).json({ error: "Nome de arquivo de legenda inv\xE1lido." });
    return;
  }
  try {
    import_fs9.default.mkdirSync(subtitleDirectory, { recursive: true });
    import_fs9.default.writeFileSync(normalizedTargetPath, content);
    const existingArrayIndex = pair.episode.subtitleTracks.findIndex(
      (track) => track.isImported && track.filePath && import_path9.default.resolve(track.filePath) === normalizedTargetPath
    );
    const existingTrack = existingArrayIndex >= 0 ? pair.episode.subtitleTracks[existingArrayIndex] : void 0;
    const nextTrackIndex = existingTrack?.index ?? Math.max(99, ...pair.episode.subtitleTracks.map((track) => track.index)) + 1;
    const importedTrack = {
      index: nextTrackIndex,
      streamIndex: -1,
      codec: extension.slice(1),
      language: typeof req.body?.language === "string" && req.body.language.trim() ? req.body.language.trim() : "pt",
      title: `Legenda importada (${import_path9.default.basename(safeFileName2, extension)})`,
      isExternal: true,
      isImported: true,
      source: "local",
      filePath: normalizedTargetPath
    };
    if (existingArrayIndex >= 0) {
      pair.episode.subtitleTracks[existingArrayIndex] = importedTrack;
    } else {
      pair.episode.subtitleTracks.push(importedTrack);
    }
    writeLibrary(readLibrary(), true);
    res.json({ success: true, track: importedTrack });
  } catch (error) {
    console.error("[Subtitles] Falha ao importar legenda:", error);
    res.status(500).json({ error: error?.message || "N\xE3o foi poss\xEDvel importar a legenda." });
  }
});
apiRouter.delete("/media/:mediaId/episode/:episodeId/subtitles/:index", (req, res) => {
  const { mediaId, episodeId } = req.params;
  const trackIndex = Number.parseInt(req.params.index, 10);
  const pair = findEpisode(mediaId, episodeId);
  if (!pair) {
    res.status(404).json({ error: "Epis\xF3dio n\xE3o encontrado" });
    return;
  }
  const arrayIndex = pair.episode.subtitleTracks.findIndex((track2) => track2.index === trackIndex);
  const track = arrayIndex >= 0 ? pair.episode.subtitleTracks[arrayIndex] : void 0;
  const importedDirectory = import_path9.default.join(getDataDir(), "subtitles", mediaId, episodeId);
  if (!track?.isImported || !track.filePath || !isPathInsideDirectory(track.filePath, importedDirectory)) {
    res.status(400).json({ error: "Somente legendas importadas podem ser removidas." });
    return;
  }
  try {
    if (import_fs9.default.existsSync(track.filePath)) import_fs9.default.rmSync(track.filePath, { force: true });
    pair.episode.subtitleTracks.splice(arrayIndex, 1);
    if (pair.episode.selectedSubtitleIndex !== void 0) {
      if (pair.episode.selectedSubtitleIndex === arrayIndex) {
        pair.episode.selectedSubtitleIndex = -1;
      } else if (pair.episode.selectedSubtitleIndex > arrayIndex) {
        pair.episode.selectedSubtitleIndex -= 1;
      }
    }
    writeLibrary(readLibrary(), true);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error?.message || "N\xE3o foi poss\xEDvel remover a legenda." });
  }
});
apiRouter.post("/media/:id/banner", (req, res) => {
  const { id } = req.params;
  const { bannerUrl } = req.body;
  const ok = updateMediaBanner(id, typeof bannerUrl === "string" ? bannerUrl : "");
  if (!ok) {
    res.status(404).json({ error: "M\xEDdia n\xE3o encontrada" });
    return;
  }
  const updatedMedia = findMediaItem(id);
  res.json({ success: true, media: updatedMedia });
});
apiRouter.post("/media/:id/poster", (req, res) => {
  const { id } = req.params;
  const { posterUrl } = req.body;
  const ok = updateMediaPoster(id, typeof posterUrl === "string" ? posterUrl : "");
  if (!ok) {
    res.status(404).json({ error: "M\xEDdia n\xE3o encontrada" });
    return;
  }
  const updatedMedia = findMediaItem(id);
  res.json({ success: true, media: updatedMedia });
});
apiRouter.get("/media/:mediaId/poster", async (req, res) => {
  const { mediaId } = req.params;
  const media = findMediaItem(mediaId);
  if (!media) {
    res.status(404).send("M\xEDdia n\xE3o encontrada");
    return;
  }
  if (media.posterPath && (media.posterPath.startsWith("http://") || media.posterPath.startsWith("https://"))) {
    res.redirect(media.posterPath);
    return;
  }
  if (media.posterPath && import_fs9.default.existsSync(media.posterPath)) {
    res.sendFile(media.posterPath);
    return;
  }
  const cachedPoster = import_path9.default.join(getDataDir(), "metadata", mediaId, "poster.jpg");
  if (import_fs9.default.existsSync(cachedPoster) && import_fs9.default.statSync(cachedPoster).size > 1e3) {
    res.sendFile(cachedPoster);
    return;
  }
  const firstEp = media.seasons[0]?.episodes[0];
  if (firstEp && import_fs9.default.existsSync(firstEp.filePath)) {
    try {
      const embedded = await extractEmbeddedCover(firstEp.filePath);
      if (embedded && import_fs9.default.existsSync(embedded) && import_fs9.default.statSync(embedded).size > 1e3) {
        res.sendFile(embedded);
        return;
      }
    } catch {
    }
    try {
      const thumbPath = await generateThumbnail(firstEp.filePath, 10, "poster");
      if (thumbPath && import_fs9.default.existsSync(thumbPath)) {
        res.sendFile(thumbPath);
        return;
      }
    } catch {
    }
  }
  if (media.backdropPath && (media.backdropPath.startsWith("http://") || media.backdropPath.startsWith("https://"))) {
    res.redirect(media.backdropPath);
    return;
  }
  if (media.backdropPath && import_fs9.default.existsSync(media.backdropPath)) {
    res.sendFile(media.backdropPath);
    return;
  }
  res.status(404).send("Poster n\xE3o encontrado");
});
apiRouter.get(["/media/:mediaId/backdrop", "/media/:mediaId/banner"], (req, res) => {
  const { mediaId } = req.params;
  const media = findMediaItem(mediaId);
  if (!media) {
    res.status(404).send("M\xEDdia n\xE3o encontrada");
    return;
  }
  if (media.backdropPath && (media.backdropPath.startsWith("http://") || media.backdropPath.startsWith("https://"))) {
    res.redirect(media.backdropPath);
    return;
  }
  if (media.backdropPath && import_fs9.default.existsSync(media.backdropPath)) {
    res.sendFile(media.backdropPath);
    return;
  }
  const cachedBackdrop = import_path9.default.join(getDataDir(), "metadata", mediaId, "backdrop.jpg");
  if (import_fs9.default.existsSync(cachedBackdrop) && import_fs9.default.statSync(cachedBackdrop).size > 1e3) {
    res.sendFile(cachedBackdrop);
    return;
  }
  if (media.posterPath && (media.posterPath.startsWith("http://") || media.posterPath.startsWith("https://"))) {
    res.redirect(media.posterPath);
    return;
  }
  if (media.posterPath && import_fs9.default.existsSync(media.posterPath)) {
    res.sendFile(media.posterPath);
    return;
  }
  const firstEp = media.seasons[0]?.episodes[0];
  if (firstEp && import_fs9.default.existsSync(firstEp.filePath)) {
    generateThumbnail(firstEp.filePath, 10, "landscape").then((thumbPath) => {
      if (thumbPath && import_fs9.default.existsSync(thumbPath)) {
        res.sendFile(thumbPath);
      } else {
        res.status(404).send("Banner n\xE3o dispon\xEDvel");
      }
    });
    return;
  }
  res.status(404).send("Banner n\xE3o encontrado");
});
apiRouter.get("/media/:mediaId/episode/:episodeId/thumb", async (req, res) => {
  const { mediaId, episodeId } = req.params;
  const pair = findEpisode(mediaId, episodeId);
  if (!pair) {
    res.status(404).send("Epis\xF3dio n\xE3o encontrado");
    return;
  }
  if (pair.episode.stillPath) {
    if (pair.episode.stillPath.startsWith("http://") || pair.episode.stillPath.startsWith("https://")) {
      res.redirect(pair.episode.stillPath);
      return;
    }
    if (import_fs9.default.existsSync(pair.episode.stillPath)) {
      res.sendFile(pair.episode.stillPath);
      return;
    }
  }
  const filePath = pair.episode.filePath;
  if (!import_fs9.default.existsSync(filePath)) {
    res.status(404).send("Arquivo n\xE3o encontrado");
    return;
  }
  const targetSec = pair.episode.progressSeconds > 10 ? pair.episode.progressSeconds : 15;
  const thumbPath = await generateThumbnail(filePath, targetSec);
  if (thumbPath && import_fs9.default.existsSync(thumbPath)) {
    res.sendFile(thumbPath);
  } else {
    res.status(404).send("Miniatura indispon\xEDvel");
  }
});
apiRouter.get("/browse", (req, res) => {
  try {
    const queryDir = req.query.dir || process.cwd();
    const resolvedDir = import_path9.default.resolve(queryDir);
    if (!import_fs9.default.existsSync(resolvedDir)) {
      res.status(404).json({ error: "Diret\xF3rio n\xE3o existe" });
      return;
    }
    const items = import_fs9.default.readdirSync(resolvedDir, { withFileTypes: true });
    const result = [];
    const parent = import_path9.default.dirname(resolvedDir);
    if (parent !== resolvedDir) {
      result.push({
        name: "..",
        path: parent,
        isDirectory: true
      });
    }
    for (const item of items) {
      if (item.name.startsWith(".") || item.name === "$RECYCLE.BIN" || item.name === "node_modules") {
        continue;
      }
      const fullPath = import_path9.default.join(resolvedDir, item.name);
      try {
        if (item.isDirectory()) {
          let hasMedia = false;
          try {
            const sub = import_fs9.default.readdirSync(fullPath);
            hasMedia = sub.some((f) => /\.(mp4|mkv|avi|webm|mov)$/i.test(f));
          } catch {
          }
          result.push({
            name: item.name,
            path: fullPath,
            isDirectory: true,
            hasMediaFiles: hasMedia
          });
        }
      } catch {
      }
    }
    result.sort((a, b) => {
      if (a.name === "..") return -1;
      if (b.name === "..") return 1;
      return a.name.localeCompare(b.name);
    });
    res.json({
      currentDir: resolvedDir,
      parentDir: parent !== resolvedDir ? parent : null,
      items: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/system/status", (req, res) => {
  const { ffmpeg, ffprobe } = getBinaries();
  const lib = readLibrary();
  const status = {
    ffmpegFound: !!ffmpeg,
    ffmpegPath: ffmpeg || void 0,
    ffprobeFound: !!ffprobe,
    ffprobePath: ffprobe || void 0,
    appDir: process.cwd(),
    dataDir: getDataDir(),
    libraryPath: import_path9.default.join(getDataDir(), "library.json"),
    totalItems: lib.items.length,
    platform: process.platform,
    tmdbConfigured: isTmdbConfigured(),
    tmdbApiKeyConfigured: Boolean(getApiKey()),
    tmdbLanguage: getLanguage(),
    openSubtitlesConfigured: isOpenSubtitlesConfigured(),
    openSubtitlesAccountConfigured: isOpenSubtitlesAccountConfigured(),
    openSubtitlesUsername: getOpenSubtitlesUsername(),
    hardwareAcceleration: getHardwareAccelerationStatus()
  };
  res.json(status);
});
apiRouter.post("/system/tmdb", (req, res) => {
  const { apiKey, accessToken, language } = req.body;
  updateTmdbSettings(apiKey, accessToken, language);
  if (apiKey && typeof apiKey === "string") {
    process.env.TMDB_API_KEY = apiKey.trim();
  }
  if (accessToken && typeof accessToken === "string") {
    process.env.TMDB_ACCESS_TOKEN = accessToken.trim();
  }
  if (language && typeof language === "string") {
    process.env.TMDB_LANGUAGE = language.trim();
  }
  res.json({
    success: true,
    tmdbConfigured: isTmdbConfigured(),
    tmdbLanguage: getLanguage()
  });
});
apiRouter.get("/system/tmdb/search", async (req, res) => {
  if (!isTmdbConfigured()) {
    res.status(503).json({ error: "TMDb n\xE3o configurado" });
    return;
  }
  const query = typeof req.query.query === "string" ? req.query.query : "";
  const kind = req.query.kind === "series" ? "series" : "movie";
  const results = await searchTmdb(query, kind);
  res.json({ results });
});
apiRouter.get("/system/cast-info", (req, res) => {
  const addresses = Object.values(import_os2.default.networkInterfaces()).flatMap((entries) => entries || []).filter((entry) => {
    const isIpv4 = entry.family === "IPv4" || String(entry.family) === "4";
    return isIpv4 && !entry.internal && !entry.address.startsWith("169.254.");
  }).map((entry) => entry.address);
  res.json({
    protocol: req.app.locals.castMediaProtocol || null,
    port: Number(req.app.locals.castMediaPort) || null,
    addresses: [...new Set(addresses)]
  });
});
apiRouter.get("/system/network-info", (req, res) => {
  const httpsRequested = process.env.HTTPS === "true" || process.env.HTTPS === "1";
  const certificateDirectory = process.env.HTTPS_CERT_DIR || import_path9.default.join(process.cwd(), "certs");
  const pfxPath = process.env.HTTPS_PFX_PATH || import_path9.default.join(certificateDirectory, "cinelocal.pfx");
  const useHttps = httpsRequested && import_fs9.default.existsSync(pfxPath);
  const protocol = useHttps ? "https" : "http";
  const configuredPort = Number(process.env.PORT);
  const port = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3e3;
  const addresses = Object.values(import_os2.default.networkInterfaces()).flatMap((entries) => entries || []).filter((entry) => {
    const isIpv4 = entry.family === "IPv4" || String(entry.family) === "4";
    return isIpv4 && !entry.internal && !entry.address.startsWith("169.254.");
  }).map((entry) => entry.address);
  const uniqueAddresses = [...new Set(addresses)];
  const mobileUrls = uniqueAddresses.map((ip) => `${protocol}://${ip}:${port}`);
  res.json({
    protocol,
    port,
    addresses: uniqueAddresses,
    mobileUrls,
    certPath: import_path9.default.join(certificateDirectory, "cinelocal.crt")
  });
});
apiRouter.post("/system/hardware-acceleration", (req, res) => {
  const { mode, encoder } = req.body || {};
  if (mode && !["auto", "software", "off"].includes(mode)) {
    res.status(400).json({ error: "Modo inv\xE1lido. Use auto, software ou off." });
    return;
  }
  setHardwareAccelerationConfig({
    mode,
    encoder: typeof encoder === "string" ? encoder : void 0
  });
  res.json({ success: true, hardwareAcceleration: getHardwareAccelerationStatus() });
});
apiRouter.post("/system/install-ffmpeg", async (req, res) => {
  try {
    const result = await downloadAndInstallFFmpeg();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "Erro ao baixar FFmpeg" });
  }
});
apiRouter.post("/system/pick-folder", (req, res) => {
  const platform = process.platform;
  if (platform === "win32") {
    const script = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
$app = New-Object -ComObject Shell.Application;
$folder = $app.BrowseForFolder(0, 'Selecione a pasta onde estao seus filmes ou series:', 0, 0);
if ($folder -and $folder.Self.Path) {
    [Console]::Out.Write($folder.Self.Path)
}
`;
    (0, import_child_process3.execFile)(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
      { timeout: 12e4, encoding: "utf-8" },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            res.json({ success: false, cancelled: true, message: "Tempo limite esgotado" });
          } else {
            res.json({ success: false, unsupported: true, error: error.message });
          }
          return;
        }
        const selected = (stdout || "").trim();
        if (!selected) {
          res.json({ success: false, cancelled: true });
          return;
        }
        res.json({ success: true, folderPath: selected });
      }
    );
    return;
  }
  if (platform === "darwin") {
    const script = `POSIX path of (choose folder with prompt "Selecione a pasta onde estao seus filmes ou series:")`;
    (0, import_child_process3.execFile)("osascript", ["-e", script], { timeout: 12e4, encoding: "utf-8" }, (error, stdout) => {
      if (error) {
        res.json({ success: false, cancelled: true });
        return;
      }
      const selected = (stdout || "").trim();
      if (!selected) {
        res.json({ success: false, cancelled: true });
        return;
      }
      res.json({ success: true, folderPath: selected });
    });
    return;
  }
  if (platform === "linux") {
    if (!process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) {
      res.json({
        success: false,
        unsupported: true,
        message: "Ambiente gr\xE1fico n\xE3o dispon\xEDvel para abrir explorador nativo"
      });
      return;
    }
    const cmd = `zenity --file-selection --directory --title="Selecione a pasta de midia" 2>/dev/null || kdialog --getexistingdirectory 2>/dev/null`;
    (0, import_child_process3.exec)(cmd, { timeout: 12e4, encoding: "utf-8" }, (error, stdout) => {
      if (error) {
        res.json({ success: false, cancelled: true });
        return;
      }
      const selected = (stdout || "").trim();
      if (!selected) {
        res.json({ success: false, cancelled: true });
        return;
      }
      res.json({ success: true, folderPath: selected });
    });
    return;
  }
  res.json({
    success: false,
    unsupported: true,
    message: "Sistema operacional n\xE3o suportado para explorador nativo"
  });
});
apiRouter.post("/system/generate-demo", async (req, res) => {
  const { ffmpeg } = getBinaries();
  if (!ffmpeg) {
    res.status(500).json({ error: "FFmpeg n\xE3o dispon\xEDvel para gerar m\xEDdia de demonstra\xE7\xE3o" });
    return;
  }
  try {
    const demoDir = import_path9.default.resolve(process.cwd(), "demo_media", "Cosmos - O Infinito");
    if (!import_fs9.default.existsSync(demoDir)) {
      import_fs9.default.mkdirSync(demoDir, { recursive: true });
    }
    const ep1 = import_path9.default.join(demoDir, "Cosmos.S01E01.A.Grande.Jornada.mp4");
    const ep2 = import_path9.default.join(demoDir, "Cosmos.S01E02.As.Estrelas.mkv");
    const poster = import_path9.default.join(demoDir, "folder.jpg");
    if (!import_fs9.default.existsSync(poster)) {
      await new Promise((resolve, reject) => {
        (0, import_child_process3.execFile)(
          ffmpeg,
          [
            "-f",
            "lavfi",
            "-i",
            "color=c=0x1a237e:s=600x900:d=1",
            "-vf",
            "drawtext=text='COSMOS':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=200,drawtext=text='TEMPORADA 1':fontcolor=0xffd700:fontsize=28:x=(w-text_w)/2:y=280",
            "-vframes",
            "1",
            "-y",
            poster
          ],
          (err) => err ? resolve(false) : resolve(true)
        );
      });
    }
    if (!import_fs9.default.existsSync(ep1)) {
      await new Promise((resolve) => {
        (0, import_child_process3.execFile)(
          ffmpeg,
          [
            "-f",
            "lavfi",
            "-i",
            "testsrc=duration=20:size=1280x720:rate=30",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=440:duration=20",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-metadata:s:a:0",
            "language=por",
            "-metadata:s:a:0",
            "title=Portugu\xEAs (Brasil)",
            "-y",
            ep1
          ],
          (err) => resolve(!err)
        );
      });
    }
    if (!import_fs9.default.existsSync(ep2)) {
      await new Promise((resolve) => {
        (0, import_child_process3.execFile)(
          ffmpeg,
          [
            "-f",
            "lavfi",
            "-i",
            "smptebars=duration=25:size=1280x720:rate=30",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=520:duration=25",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=880:duration=25",
            "-map",
            "0:v",
            "-map",
            "1:a",
            "-map",
            "2:a",
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-metadata:s:a:0",
            "language=por",
            "-metadata:s:a:0",
            "title=Portugu\xEAs (Dublado)",
            "-metadata:s:a:1",
            "language=eng",
            "-metadata:s:a:1",
            "title=Ingl\xEAs (Original)",
            "-y",
            ep2
          ],
          (err) => resolve(!err)
        );
      });
    }
    const mediaItem = await scanMediaFolder(demoDir, "Cosmos: O Infinito");
    const lib = readLibrary();
    const existingIdx = lib.items.findIndex((i) => i.id === mediaItem.id);
    if (existingIdx >= 0) {
      lib.items[existingIdx] = mediaItem;
    } else {
      lib.items.push(mediaItem);
    }
    writeLibrary(lib);
    res.json({ success: true, item: mediaItem });
  } catch (err) {
    console.error("Error generating demo:", err);
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/torrent/start", async (req, res) => {
  try {
    const { magnetUri } = req.body;
    if (!magnetUri || typeof magnetUri !== "string") {
      res.status(400).json({ error: "Link magnet ou hash do torrent \xE9 obrigat\xF3rio" });
      return;
    }
    const record = await getOrCreateTorrentEngine(magnetUri);
    const status = getTorrentStatus(record.infoHash);
    res.json(status);
  } catch (err) {
    console.error("Erro ao iniciar torrent:", err);
    res.status(500).json({ error: err?.message || "Erro ao iniciar torrent" });
  }
});
apiRouter.get("/torrent/status/:infoHash", (req, res) => {
  const { infoHash } = req.params;
  const status = getTorrentStatus(infoHash);
  res.json(status);
});
apiRouter.post("/torrent/select", (req, res) => {
  const { infoHash, fileIndex } = req.body;
  if (!infoHash || typeof fileIndex !== "number") {
    res.status(400).json({ error: "infoHash e fileIndex s\xE3o obrigat\xF3rios" });
    return;
  }
  const ok = selectTorrentFile(infoHash, fileIndex);
  res.json({ success: ok });
});
apiRouter.get("/torrent/stream/:infoHash/:fileIndex", async (req, res) => {
  const { infoHash, fileIndex } = req.params;
  const parsedIdx = parseInt(fileIndex, 10);
  const transcode = req.query.transcode === "true" || req.query.transcode === "1";
  const isCast = req.query.cast === "true" || req.query.cast === "1";
  const file = getTorrentFile(infoHash, isNaN(parsedIdx) ? 0 : parsedIdx);
  if (!file) {
    res.status(404).send("Arquivo do torrent n\xE3o encontrado ou metadados ainda carregando.");
    return;
  }
  const ext = import_path9.default.extname(file.name).toLowerCase();
  let contentType = "video/mp4";
  if (ext === ".webm") contentType = "video/webm";
  else if (ext === ".mkv") contentType = "video/x-matroska";
  else if (ext === ".avi") contentType = "video/x-msvideo";
  else if (ext === ".mov") contentType = "video/quicktime";
  else if (ext === ".ts") contentType = "video/mp2t";
  else if (ext === ".srt" || ext === ".vtt") contentType = "text/plain; charset=utf-8";
  const totalSize = file.length || 0;
  if (transcode || isCast && (ext === ".mkv" || ext === ".avi" || ext === ".wmv")) {
    const { ffmpeg } = getBinaries();
    if (!ffmpeg) {
      console.warn("[Torrent Stream] FFmpeg n\xE3o encontrado para transcode.");
    } else {
      res.writeHead(200, {
        "Content-Type": "video/mp4",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Connection": "keep-alive"
      });
      const inputStream = file.createReadStream();
      const ffmpegProc = (0, import_child_process3.spawn)(ffmpeg, [
        "-i",
        "pipe:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ac",
        "2",
        "-movflags",
        "frag_keyframe+default_base_moof",
        "-f",
        "mp4",
        "pipe:1"
      ]);
      inputStream.pipe(ffmpegProc.stdin);
      ffmpegProc.stdout.pipe(res);
      ffmpegProc.on("error", (err) => {
        console.error("Erro no FFmpeg transcode torrent:", err);
      });
      res.on("close", () => {
        try {
          inputStream.destroy();
          ffmpegProc.kill("SIGKILL");
        } catch {
        }
      });
      return;
    }
  }
  const range = req.headers.range;
  if (!range) {
    res.writeHead(200, {
      "Content-Length": totalSize,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache"
    });
    const stream2 = file.createReadStream();
    stream2.pipe(res);
    res.on("close", () => {
      try {
        stream2.destroy();
      } catch {
      }
    });
    return;
  }
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
  if (start >= totalSize || end >= totalSize || start > end) {
    res.status(416).set("Content-Range", `bytes */${totalSize}`).end();
    return;
  }
  const chunkSize = end - start + 1;
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${totalSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": contentType,
    "Cache-Control": "no-cache"
  });
  const stream = file.createReadStream({ start, end });
  stream.pipe(res);
  stream.on("error", (err) => {
    console.error("[Torrent Stream Read Error]:", err);
    if (!res.headersSent) res.status(500).end();
  });
  res.on("close", () => {
    try {
      stream.destroy();
    } catch {
    }
  });
});
apiRouter.post("/media/:id/kind", (req, res) => {
  const { id } = req.params;
  const { kind } = req.body;
  if (kind !== "movie" && kind !== "series") {
    res.status(400).json({ error: 'Tipo inv\xE1lido (deve ser "movie" ou "series")' });
    return;
  }
  const updated = updateMediaKind(id, kind);
  if (!updated) {
    res.status(404).json({ error: "M\xEDdia n\xE3o encontrada" });
    return;
  }
  res.json({ success: true, item: updated });
});
apiRouter.patch("/media/:id/kind", (req, res) => {
  const { id } = req.params;
  const { kind } = req.body;
  if (kind !== "movie" && kind !== "series") {
    res.status(400).json({ error: 'Tipo inv\xE1lido (deve ser "movie" ou "series")' });
    return;
  }
  const updated = updateMediaKind(id, kind);
  if (!updated) {
    res.status(404).json({ error: "M\xEDdia n\xE3o encontrada" });
    return;
  }
  res.json({ success: true, item: updated });
});
apiRouter.get("/torrent/history", (_req, res) => {
  const history = readTorrentHistory();
  const lib = readLibrary();
  const enriched = history.map((item) => {
    const cleanHash = item.infoHash.toLowerCase();
    const media = lib.items.find(
      (m) => m.infoHash && m.infoHash.toLowerCase() === cleanHash || m.id === `torrent_${cleanHash}`
    );
    const inferredKind = media?.kind || (/[Ss]\d{1,2}|Season\s*\d+|Temporada\s*\d+/i.test(item.name) ? "series" : "movie");
    return {
      ...item,
      kind: inferredKind
    };
  });
  res.json(enriched);
});
apiRouter.post("/torrent/progress", (req, res) => {
  const { infoHash, magnetUri, name, progressSeconds, durationSeconds, selectedFileIndex, totalBytes } = req.body;
  if (!infoHash) {
    res.status(400).json({ error: "infoHash \xE9 obrigat\xF3rio" });
    return;
  }
  saveTorrentHistoryItem({
    infoHash,
    magnetUri: magnetUri || `magnet:?xt=urn:btih:${infoHash}`,
    name,
    progressSeconds: Math.floor(progressSeconds || 0),
    durationSeconds: Math.floor(durationSeconds || 0),
    selectedFileIndex: selectedFileIndex || 0,
    totalBytes: totalBytes || 0
  });
  try {
    updateTorrentProgressInLibrary(
      infoHash,
      selectedFileIndex || 0,
      progressSeconds || 0,
      durationSeconds || 0
    );
  } catch (err) {
    console.error("Erro ao atualizar progresso do torrent na biblioteca:", err);
  }
  res.json({ success: true });
});
apiRouter.delete("/torrent/history/:infoHash", (req, res) => {
  const { infoHash } = req.params;
  removeTorrentHistoryItem(infoHash);
  res.json({ success: true });
});
apiRouter.post("/torrent/stop", async (req, res) => {
  const { infoHash, deleteCache } = req.body;
  if (!infoHash) {
    res.status(400).json({ error: "infoHash \xE9 obrigat\xF3rio" });
    return;
  }
  const ok = await stopTorrent(infoHash, deleteCache === true);
  res.json({ success: ok });
});
var IPTV_FAVORITES_FILE = import_path9.default.join(getDataDir(), "iptv_favorites.json");
function getIptvFavorites() {
  try {
    if (import_fs9.default.existsSync(IPTV_FAVORITES_FILE)) {
      return JSON.parse(import_fs9.default.readFileSync(IPTV_FAVORITES_FILE, "utf-8"));
    }
  } catch {
  }
  return [];
}
function saveIptvFavorites(favs) {
  try {
    import_fs9.default.writeFileSync(IPTV_FAVORITES_FILE, JSON.stringify(favs, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar favoritos IPTV:", err);
  }
}
apiRouter.get("/iptv/presets", (_req, res) => {
  res.json(IPTV_PRESETS);
});
apiRouter.get("/iptv/playlist", async (req, res) => {
  try {
    const url = req.query.url || "https://iptv-org.github.io/iptv/index.m3u";
    const forceRefresh = req.query.refresh === "true";
    const summary = await fetchIptvPlaylist(url, forceRefresh);
    res.json(summary);
  } catch (error) {
    console.error("Erro ao carregar playlist IPTV:", error);
    res.status(500).json({ error: error.message || "Falha ao carregar playlist IPTV" });
  }
});
apiRouter.post("/iptv/parse-custom", (req, res) => {
  try {
    const { content, name } = req.body;
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "Conte\xFAdo M3U inv\xE1lido" });
      return;
    }
    const summary = parseM3U(content, name || "Playlist Personalizada");
    res.json(summary);
  } catch (error) {
    console.error("Erro ao processar M3U personalizado:", error);
    res.status(500).json({ error: error.message || "Erro ao processar M3U" });
  }
});
apiRouter.get("/iptv/favorites", (_req, res) => {
  res.json({ favorites: getIptvFavorites() });
});
apiRouter.post("/iptv/favorites", (req, res) => {
  const { channelId, isFavorite, favorites } = req.body;
  let current = getIptvFavorites();
  if (Array.isArray(favorites)) {
    current = favorites;
  } else if (channelId) {
    if (isFavorite === true) {
      if (!current.includes(channelId)) current.push(channelId);
    } else if (isFavorite === false) {
      current = current.filter((id) => id !== channelId);
    } else {
      if (current.includes(channelId)) {
        current = current.filter((id) => id !== channelId);
      } else {
        current.push(channelId);
      }
    }
  }
  saveIptvFavorites(current);
  res.json({ success: true, favorites: current });
});
apiRouter.get("/iptv/statuses", (_req, res) => {
  const map = readIptvStatusMap();
  res.json(map);
});
apiRouter.post("/iptv/report-status", (req, res) => {
  const { url, status } = req.body;
  if (!url || !status) {
    res.status(400).json({ error: "url e status s\xE3o obrigat\xF3rios" });
    return;
  }
  const map = readIptvStatusMap();
  map[url] = {
    status: status === "online" ? "online" : "offline",
    lastChecked: (/* @__PURE__ */ new Date()).toISOString()
  };
  saveIptvStatusMap(map);
  res.json({ success: true, status: map[url] });
});
apiRouter.post("/iptv/check-batch", async (req, res) => {
  const urls = req.body.urls;
  if (!Array.isArray(urls) || urls.length === 0) {
    res.json({ results: {} });
    return;
  }
  const targetUrls = urls.slice(0, 60);
  const statusMap = readIptvStatusMap();
  const results = {};
  const probeChannel = async (channelUrl) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const parsedTarget = new URL(channelUrl);
      const resp = await fetch(channelUrl, {
        method: "GET",
        headers: {
          "User-Agent": "VLC/3.0.20 LibVLC/3.0.20 (Windows NT 10.0; Win64; x64)",
          Referer: parsedTarget.origin,
          Range: "bytes=0-2048",
          Accept: "*/*"
        },
        signal: controller.signal,
        redirect: "follow"
      });
      clearTimeout(timeoutId);
      if (!resp.ok && resp.status !== 206) {
        const entry2 = { status: "offline", lastChecked: (/* @__PURE__ */ new Date()).toISOString() };
        results[channelUrl] = entry2;
        statusMap[channelUrl] = entry2;
        return;
      }
      const contentType = (resp.headers.get("content-type") || "").toLowerCase();
      const buffer = await resp.arrayBuffer().catch(() => new ArrayBuffer(0));
      const textSample = Buffer.from(buffer).toString("utf-8", 0, Math.min(buffer.byteLength, 1024));
      const isHtml = contentType.includes("text/html") || textSample.toLowerCase().includes("<!doctype html") || textSample.toLowerCase().includes("<html") || textSample.toLowerCase().includes("403 forbidden") || textSample.toLowerCase().includes("access denied");
      const isM3U8 = textSample.includes("#EXTM3U") || textSample.includes("#EXTINF") || textSample.includes("#EXT-X-") || contentType.includes("mpegurl");
      const isTsOrVideo = contentType.includes("video/") || contentType.includes("application/octet-stream") || buffer.byteLength > 0 && Buffer.from(buffer)[0] === 71;
      const isOnline = !isHtml && (isM3U8 || isTsOrVideo || buffer.byteLength > 100);
      const statusValue = isOnline ? "online" : "offline";
      const entry = { status: statusValue, lastChecked: (/* @__PURE__ */ new Date()).toISOString() };
      results[channelUrl] = entry;
      statusMap[channelUrl] = entry;
    } catch {
      const entry = { status: "offline", lastChecked: (/* @__PURE__ */ new Date()).toISOString() };
      results[channelUrl] = entry;
      statusMap[channelUrl] = entry;
    }
  };
  const CHUNK_SIZE = 8;
  for (let i = 0; i < targetUrls.length; i += CHUNK_SIZE) {
    const chunk = targetUrls.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map((u) => probeChannel(u)));
  }
  saveIptvStatusMap(statusMap);
  res.json({ results });
});
apiRouter.get("/iptv/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).send("URL \xE9 obrigat\xF3ria");
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  try {
    const parsedTarget = new URL(targetUrl);
    const userAgent = req.query.userAgent || "VLC/3.0.20 LibVLC/3.0.20 (Windows NT 10.0; Win64; x64)";
    const referrer = req.query.referrer || parsedTarget.origin;
    const country = req.query.country || "";
    const fetchHeaders = {
      "User-Agent": userAgent,
      Referer: referrer,
      Origin: parsedTarget.origin,
      Accept: "*/*",
      Connection: "keep-alive"
    };
    if (country === "BR") {
      fetchHeaders["X-Forwarded-For"] = "177.18.200.50";
      fetchHeaders["Client-IP"] = "177.18.200.50";
    } else if (country === "PT") {
      fetchHeaders["X-Forwarded-For"] = "188.82.100.20";
      fetchHeaders["Client-IP"] = "188.82.100.20";
    } else if (country === "US") {
      fetchHeaders["X-Forwarded-For"] = "198.51.100.42";
      fetchHeaders["Client-IP"] = "198.51.100.42";
    }
    if (req.headers.range) {
      fetchHeaders["Range"] = req.headers.range;
    }
    const response = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: "follow"
    });
    if (!response.ok && response.status !== 206) {
      res.status(response.status).send(`Erro do stream remoto: ${response.statusText}`);
      return;
    }
    const finalBaseUrl = response.url || targetUrl;
    const contentType = response.headers.get("content-type") || "";
    const isM3U8 = contentType.includes("mpegurl") || contentType.includes("application/vnd.apple.mpegurl") || contentType.includes("application/x-mpegurl") || finalBaseUrl.includes(".m3u8") || finalBaseUrl.includes("playlist") || finalBaseUrl.includes(".m3u");
    if (isM3U8) {
      const text = await response.text();
      if (text.includes("#EXTM3U") || text.includes("#EXTINF") || text.includes("#EXT-X-")) {
        const lines = text.split(/\r?\n/);
        const rewrittenLines = [];
        const extraQueryParams = (req.query.userAgent ? `&userAgent=${encodeURIComponent(req.query.userAgent)}` : "") + (req.query.referrer ? `&referrer=${encodeURIComponent(req.query.referrer)}` : "") + (req.query.country ? `&country=${encodeURIComponent(req.query.country)}` : "");
        for (let line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            rewrittenLines.push(line);
            continue;
          }
          if (trimmed.startsWith("#EXT-X-KEY:") || trimmed.startsWith("#EXT-X-MAP:")) {
            const rewrittenTag = trimmed.replace(/URI="([^"]+)"/g, (_, uri) => {
              try {
                const absUrl = new URL(uri, finalBaseUrl).href;
                const proxyUrl = `/api/iptv/proxy?url=${encodeURIComponent(absUrl)}${extraQueryParams}`;
                return `URI="${proxyUrl}"`;
              } catch {
                return `URI="${uri}"`;
              }
            });
            rewrittenLines.push(rewrittenTag);
          } else if (trimmed.startsWith("#")) {
            rewrittenLines.push(line);
          } else {
            try {
              const absUrl = new URL(trimmed, finalBaseUrl).href;
              const proxyUrl = `/api/iptv/proxy?url=${encodeURIComponent(absUrl)}${extraQueryParams}`;
              rewrittenLines.push(proxyUrl);
            } catch {
              rewrittenLines.push(line);
            }
          }
        }
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(rewrittenLines.join("\n"));
        return;
      } else {
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }
        res.status(response.status).send(text);
        return;
      }
    }
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }
    const acceptRanges = response.headers.get("accept-ranges");
    if (acceptRanges) {
      res.setHeader("Accept-Ranges", acceptRanges);
    }
    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      res.setHeader("Content-Range", contentRange);
    }
    res.status(response.status);
    if (response.body) {
      try {
        const nodeStream = import_stream.Readable.fromWeb(response.body);
        nodeStream.on("error", () => {
          if (!res.writableEnded) res.end();
        });
        res.on("close", () => {
          try {
            nodeStream.destroy();
          } catch {
          }
        });
        nodeStream.pipe(res);
      } catch (streamErr) {
        const arrayBuf = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuf));
      }
    } else {
      res.end();
    }
  } catch (proxyError) {
    console.error("Erro no proxy IPTV:", proxyError);
    if (!res.headersSent) {
      res.status(502).send(`Falha ao conectar com o stream: ${proxyError.message}`);
    }
  }
});
apiRouter.get("/iptv/transmux", (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).send("URL \xE9 obrigat\xF3ria");
    return;
  }
  const { ffmpeg } = getBinaries();
  if (!ffmpeg) {
    res.status(503).send("FFmpeg n\xE3o encontrado no sistema para modo transmux");
    return;
  }
  const userAgent = req.query.userAgent || "VLC/3.0.20 LibVLC/3.0.20 (Windows NT 10.0; Win64; x64)";
  const referrer = req.query.referrer || "";
  const country = req.query.country || "";
  const headersList = [
    `User-Agent: ${userAgent}`,
    `Accept: */*`,
    `Connection: keep-alive`
  ];
  if (referrer) {
    headersList.push(`Referer: ${referrer}`);
  }
  if (country === "BR") {
    headersList.push("X-Forwarded-For: 177.18.200.50");
    headersList.push("Client-IP: 177.18.200.50");
  } else if (country === "PT") {
    headersList.push("X-Forwarded-For: 188.82.100.20");
    headersList.push("Client-IP: 188.82.100.20");
  } else if (country === "US") {
    headersList.push("X-Forwarded-For: 198.51.100.42");
    headersList.push("Client-IP: 198.51.100.42");
  }
  const args = [
    "-protocol_whitelist",
    "file,http,https,tcp,tls,crypto,data",
    "-allowed_extensions",
    "ALL",
    "-headers",
    headersList.join("\r\n") + "\r\n",
    "-user_agent",
    userAgent,
    "-i",
    targetUrl,
    "-map",
    "0:v:0?",
    "-map",
    "0:a:0?",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-tune",
    "zerolatency",
    "-crf",
    "25",
    "-pix_fmt",
    "yuv420p",
    "-g",
    "25",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-f",
    "mp4",
    "-movflags",
    "frag_keyframe+empty_moov+default_base_moof",
    "pipe:1"
  ];
  console.log(`[FFmpeg IPTV Transmux] Iniciando streaming de: ${targetUrl}`);
  const proc = (0, import_child_process3.spawn)(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"] });
  let hasSentData = false;
  let stderrBuffer = "";
  proc.stdout.on("data", (chunk) => {
    if (!hasSentData) {
      hasSentData = true;
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "no-cache, no-store");
      res.status(200);
    }
    res.write(chunk);
  });
  proc.stderr.on("data", (d) => {
    const msg = d.toString();
    stderrBuffer += msg;
    if (stderrBuffer.length > 2e3) {
      stderrBuffer = stderrBuffer.substring(stderrBuffer.length - 2e3);
    }
    if (msg.includes("Error") || msg.includes("403") || msg.includes("404")) {
      console.warn("[FFmpeg IPTV Transmux]", msg.trim());
    }
  });
  proc.on("close", (code) => {
    if (!hasSentData && !res.headersSent) {
      if (stderrBuffer.includes("403 Forbidden")) {
        res.status(403).send("Servidor remoto retornou 403 Forbidden (Acesso negado pela emissora)");
      } else if (stderrBuffer.includes("404 Not Found")) {
        res.status(404).send("Servidor remoto retornou 404 (Sinal n\xE3o encontrado)");
      } else {
        res.status(502).send(`Falha ao decodificar stream via FFmpeg (C\xF3digo ${code})`);
      }
    } else {
      if (!res.writableEnded) res.end();
    }
  });
  const cleanup = () => {
    try {
      proc.kill("SIGKILL");
    } catch {
    }
  };
  req.on("close", cleanup);
  res.on("finish", cleanup);
});
apiRouter.get("/iptv/export-m3u", (req, res) => {
  const streamUrl = req.query.url;
  const name = req.query.name || "Canal IPTV";
  const logo = req.query.logo || "";
  const group = req.query.group || "Geral";
  const userAgent = req.query.userAgent;
  if (!streamUrl) {
    res.status(400).send("URL do stream \xE9 obrigat\xF3ria");
    return;
  }
  let m3uContent = "#EXTM3U\n";
  m3uContent += `#EXTINF:-1 tvg-logo="${logo}" group-title="${group}",${name}
`;
  if (userAgent) {
    m3uContent += `#EXTVLCOPT:http-user-agent=${userAgent}
`;
  }
  m3uContent += `${streamUrl}
`;
  res.setHeader("Content-Type", "audio/x-mpegurl");
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name.replace(/[^a-zA-Z0-9_-]/g, "_"))}.m3u"`);
  res.send(m3uContent);
});

// server.ts
process.on("uncaughtException", (err) => {
  console.error("[CineLocal Server] Erro n\xE3o tratado interceptado (uncaughtException):", err?.message || err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[CineLocal Server] Rejei\xE7\xE3o de Promise interceptada (unhandledRejection):", reason?.message || reason);
});
async function startServer() {
  const app = (0, import_express2.default)();
  const DEFAULT_PORT = 3e3;
  const configuredPort = Number(process.env.PORT);
  const PORT = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : DEFAULT_PORT;
  const httpsRequested = process.env.HTTPS === "true" || process.env.HTTPS === "1";
  const certificateDirectory = process.env.HTTPS_CERT_DIR || import_path10.default.join(process.cwd(), "certs");
  const pfxPath = process.env.HTTPS_PFX_PATH || import_path10.default.join(certificateDirectory, "cinelocal.pfx");
  const pfxPassphrase = process.env.HTTPS_PFX_PASSPHRASE || "CineLocal-HTTPS-Local";
  const useHttps = httpsRequested && import_fs10.default.existsSync(pfxPath);
  if (httpsRequested && !useHttps) {
    console.warn(`[CineLocal] Certificado HTTPS n\xE3o encontrado em ${pfxPath}. O servidor ser\xE1 iniciado em HTTP.`);
  }
  app.use(import_express2.default.json({ limit: "20mb" }));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/media/")) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
      if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
      }
    }
    next();
  });
  app.use("/api", apiRouter);
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  const distPath = import_path10.default.join(process.cwd(), "dist");
  const distHtmlExists = import_fs10.default.existsSync(import_path10.default.join(distPath, "index.html"));
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && distHtmlExists) {
    console.log("[CineLocal] Servindo interface compilada a partir de dist/");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path10.default.join(distPath, "index.html"));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          // The app already owns the HTTP server. Do not open Vite's separate
          // HMR WebSocket (which defaults to port 24678).
          hmr: false,
          ws: false,
          watch: {
            ignored: ["**/data/**", "**/data/library.json", "**/.git/**", "**/cinelocal_hls/**", "**/tmp/**", "**/*.ts", "**/*.m3u8"]
          }
        },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn("[CineLocal] Falha ao carregar Vite dev middleware (binding nativo ou modulo ausente):", viteErr?.message || viteErr);
      if (distHtmlExists) {
        console.log("[CineLocal] Fallback ativado com sucesso: Servindo frontend a partir da pasta dist/");
        app.use(import_express2.default.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(import_path10.default.join(distPath, "index.html"));
        });
      } else {
        throw viteErr;
      }
    }
  }
  const primaryProtocol = useHttps ? "https" : "http";
  const primaryServer = useHttps ? import_https.default.createServer({ pfx: import_fs10.default.readFileSync(pfxPath), passphrase: pfxPassphrase }, app) : import_http.default.createServer(app);
  app.locals.castMediaProtocol = useHttps ? null : "http";
  app.locals.castMediaPort = useHttps ? null : PORT;
  const castMediaPort = Number(process.env.CAST_MEDIA_PORT) || PORT + 1;
  let castMediaServer = null;
  primaryServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[CineLocal] Servidor rodando em ${primaryProtocol}://localhost:${PORT}`);
    if (useHttps) {
      castMediaServer = import_http.default.createServer(app);
      castMediaServer.on("error", (err) => {
        console.error(`[CineLocal] N\xE3o foi poss\xEDvel abrir a porta HTTP auxiliar ${castMediaPort}:`, err?.message || err);
        app.locals.castMediaProtocol = null;
        app.locals.castMediaPort = null;
      });
      castMediaServer.listen(castMediaPort, "0.0.0.0", () => {
        app.locals.castMediaProtocol = "http";
        app.locals.castMediaPort = castMediaPort;
        console.log(`[CineLocal] Porta HTTP auxiliar para Chromecast: http://0.0.0.0:${castMediaPort}`);
      });
    }
  });
  primaryServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`
[ERRO FATAL] A porta ${PORT} ja esta ocupada por outro programa no seu computador!`);
      console.error(`Para usar outra porta, altere 'set PORT=3050' no arquivo start.bat para outra porta (ex: 3060, 8080).
`);
    } else {
      console.error("[ERRO FATAL] Erro ao iniciar o servidor:", err);
    }
    process.exit(1);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
