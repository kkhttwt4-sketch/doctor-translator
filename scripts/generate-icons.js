import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create clean, high-resolution SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1936" />
      <stop offset="100%" stop-color="#040916" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="16" flood-color="#0284c7" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background rounded squircle for mobile icon -->
  <rect x="0" y="0" width="512" height="512" rx="115" fill="url(#bgGrad)" />
  <rect x="8" y="8" width="496" height="496" rx="108" fill="none" stroke="#1e3a8a" stroke-width="4" opacity="0.6" />

  <!-- Center Glowing Shield / Pad -->
  <rect x="96" y="96" width="320" height="320" rx="64" fill="url(#badgeGrad)" filter="url(#glow)" />
  <rect x="108" y="108" width="296" height="296" rx="52" fill="#081024" />

  <!-- Medical Cross / Pill Symbol -->
  <g transform="translate(256, 256)" filter="url(#glow)">
    <!-- Vertical bar -->
    <rect x="-26" y="-90" width="52" height="180" rx="26" fill="url(#primaryGrad)" />
    <!-- Horizontal bar -->
    <rect x="-90" y="-26" width="180" height="52" rx="26" fill="url(#primaryGrad)" />
    <!-- Center pulse core -->
    <circle cx="0" cy="0" r="28" fill="#ffffff" />
    <!-- Stethoscope arc -->
    <circle cx="0" cy="0" r="80" fill="none" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" stroke-dasharray="140 300" transform="rotate(-45)" />
    <!-- Small heartbeat line -->
    <path d="M -18 0 L -8 0 L -4 -12 L 4 12 L 8 0 L 18 0" fill="none" stroke="#0284c7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Arabic sub-badge dot -->
  <circle cx="256" cy="445" r="8" fill="#38bdf8" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
console.log('✓ Created public/icon.svg');

// 2. Pure Node PNG generator to produce real, valid PNGs without binary dependencies
function generatePngBuffer(width, height, isMaskable = false) {
  // Precompute CRC32
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let pos = 0;

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2;
  const crossW = width * 0.12;
  const crossH = width * 0.42;

  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // Filter byte: none
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: Deep dark navy #0a132c -> #080e22
      const gradRatio = (x + y) / (width + height);
      let r = Math.round(10 - gradRatio * 3);
      let g = Math.round(19 - gradRatio * 6);
      let b = Math.round(44 - gradRatio * 10);
      let a = 255;

      // Rounded squircle corner clipping if not maskable
      if (!isMaskable) {
        const cornerRadius = width * 0.22;
        const qx = Math.abs(dx) - (cx - cornerRadius);
        const qy = Math.abs(dy) - (cy - cornerRadius);
        if (qx > 0 && qy > 0) {
          const cornerDist = Math.sqrt(qx * qx + qy * qy);
          if (cornerDist > cornerRadius) {
            a = 0; // transparent outside rounded corner
          }
        }
      }

      if (a > 0) {
        // Inner circle badge (Cyan/Blue gradient)
        const innerBadgeRadius = width * 0.38;
        if (dist <= innerBadgeRadius) {
          // Inside inner badge: dark plate
          r = 8;
          g = 16;
          b = 36;

          // Border ring
          if (dist >= innerBadgeRadius - width * 0.035) {
            r = 2;
            g = 132;
            b = 199;
          }

          // Medical Cross
          const inCrossV = Math.abs(dx) <= crossW / 2 && Math.abs(dy) <= crossH / 2;
          const inCrossH = Math.abs(dy) <= crossW / 2 && Math.abs(dx) <= crossH / 2;

          if (inCrossV || inCrossH) {
            // Bright cyan #38bdf8
            r = 56;
            g = 189;
            b = 248;

            // Center heart/core
            if (dist <= crossW * 0.6) {
              r = 255;
              g = 255;
              b = 255;
            }
          }
        }
      }

      rawData[pos++] = r;
      rawData[pos++] = g;
      rawData[pos++] = b;
      rawData[pos++] = a;
    }
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idatData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Generate standard PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePngBuffer(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePngBuffer(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePngBuffer(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePngBuffer(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePngBuffer(64, 64, false));

console.log('✓ Created all PNG icons in public/: 192x192, 512x512, maskable, apple-touch-icon.png (180x180), favicon.ico');
