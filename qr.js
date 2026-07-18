"use strict";
/**
 * Minimal QR code encoder (byte mode, error correction level M,
 * versions 1-6) with terminal and SVG renderers. Zero dependencies.
 */

// ---------- GF(256) arithmetic (reducing polynomial 0x11D) ----------

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(function initTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const factor = [1, EXP[i]];
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], factor[0]);
      next[j + 1] ^= gfMul(poly[j], factor[1]);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data, gen) {
  const result = new Array(gen.length - 1).fill(0);
  for (const b of data) {
    const factor = b ^ result.shift();
    result.push(0);
    if (factor !== 0) {
      for (let i = 0; i < result.length; i++) {
        result[i] ^= gfMul(gen[i + 1], factor);
      }
    }
  }
  return result;
}

// ---------- Version parameters (error correction level M) ----------

// Per version 1..6: total codewords, ECC codewords per block, block count.
const TOTAL_CODEWORDS = [26, 44, 70, 100, 134, 172];
const ECC_PER_BLOCK = [10, 16, 26, 18, 24, 16];
const NUM_BLOCKS = [1, 1, 1, 2, 2, 4];
const ALIGNMENT_POS = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

function dataCodewords(version) {
  const i = version - 1;
  return TOTAL_CODEWORDS[i] - ECC_PER_BLOCK[i] * NUM_BLOCKS[i];
}

// ---------- Encoding ----------

function buildCodewords(bytes, version) {
  const capacity = dataCodewords(version);
  const bits = [];
  const push = (val, n) => {
    for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };

  push(0b0100, 4); // byte mode
  push(bytes.length, 8); // char count (8 bits for versions 1-9)
  for (const b of bytes) push(b, 8);

  const capBits = capacity * 8;
  push(0, Math.min(4, capBits - bits.length)); // terminator
  if (bits.length % 8 !== 0) push(0, 8 - (bits.length % 8));

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    data.push(b);
  }
  for (let pad = 0xec; data.length < capacity; pad ^= 0xec ^ 0x11) {
    data.push(pad);
  }

  // Split into blocks, compute ECC, then interleave.
  const nb = NUM_BLOCKS[version - 1];
  const ec = ECC_PER_BLOCK[version - 1];
  const blockLen = capacity / nb;
  const gen = rsGeneratorPoly(ec);
  const blocks = [];
  const eccBlocks = [];
  for (let i = 0; i < nb; i++) {
    const block = data.slice(i * blockLen, (i + 1) * blockLen);
    blocks.push(block);
    eccBlocks.push(rsRemainder(block, gen));
  }

  const out = [];
  for (let i = 0; i < blockLen; i++) {
    for (const block of blocks) out.push(block[i]);
  }
  for (let i = 0; i < ec; i++) {
    for (const block of eccBlocks) out.push(block[i]);
  }
  return out;
}

// ---------- Matrix construction ----------

function drawFinder(mod, func, size, cx, cy) {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      mod[y][x] = dist !== 2 && dist !== 4 ? 1 : 0;
      func[y][x] = true;
    }
  }
}

function drawAlignment(mod, func, cx, cy) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      mod[cy + dy][cx + dx] = Math.max(Math.abs(dx), Math.abs(dy)) !== 1 ? 1 : 0;
      func[cy + dy][cx + dx] = true;
    }
  }
}

function formatBits(mask) {
  const data = (0b00 << 3) | mask; // ECL M = 00
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}

function drawFormat(mod, func, size, mask) {
  const bits = formatBits(mask);
  const bit = (i) => (bits >>> i) & 1;
  const set = (y, x, v) => {
    mod[y][x] = v;
    func[y][x] = true;
  };

  // First copy, around the top-left finder.
  for (let i = 0; i <= 5; i++) set(i, 8, bit(i));
  set(7, 8, bit(6));
  set(8, 8, bit(7));
  set(8, 7, bit(8));
  for (let i = 9; i < 15; i++) set(8, 14 - i, bit(i));

  // Second copy, split between top-right and bottom-left.
  for (let i = 0; i < 8; i++) set(8, size - 1 - i, bit(i));
  for (let i = 8; i < 15; i++) set(size - 15 + i, 8, bit(i));
  set(size - 8, 8, 1); // dark module
}

function maskBit(mask, y, x) {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function applyMask(mod, func, size, mask) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!func[y][x] && maskBit(mask, y, x)) mod[y][x] ^= 1;
    }
  }
}

function penalty(mod, size) {
  let score = 0;
  const line = new Array(size);

  const scanLine = () => {
    // Rule 1: runs of 5+ identical modules.
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) {
        run++;
      } else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
    // Rule 3: finder-like 1:1:3:1:1 pattern with 4 light modules beside it.
    const core = [1, 0, 1, 1, 1, 0, 1];
    for (let i = 0; i + 7 <= size; i++) {
      let match = true;
      for (let j = 0; j < 7; j++) {
        if (line[i + j] !== core[j]) {
          match = false;
          break;
        }
      }
      if (!match) continue;
      if (i >= 4 && line.slice(i - 4, i).every((v) => v === 0)) score += 40;
      if (i + 11 <= size && line.slice(i + 7, i + 11).every((v) => v === 0)) score += 40;
    }
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) line[x] = mod[y][x];
    scanLine();
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) line[y] = mod[y][x];
    scanLine();
  }

  // Rule 2: 2x2 blocks of the same color.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const v = mod[y][x];
      if (v === mod[y][x + 1] && v === mod[y + 1][x] && v === mod[y + 1][x + 1]) {
        score += 3;
      }
    }
  }

  // Rule 4: deviation of dark-module proportion from 50%.
  let dark = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) dark += mod[y][x];
  }
  const total = size * size;
  const k = Math.floor(Math.abs(dark * 20 - total * 10) / total);
  score += k * 10;
  return score;
}

/**
 * Encode `text` (UTF-8) as a QR code matrix.
 * Returns a 2D array of 0/1 (1 = dark module).
 */
function encode(text) {
  const bytes = Array.from(Buffer.from(String(text), "utf8"));

  let version = 0;
  for (let v = 1; v <= 6; v++) {
    if (bytes.length <= dataCodewords(v) - 2) {
      version = v;
      break;
    }
  }
  if (version === 0) {
    throw new Error("Text too long for QR versions 1-6 (max 106 bytes)");
  }

  const size = 17 + 4 * version;
  const mod = Array.from({ length: size }, () => new Array(size).fill(0));
  const func = Array.from({ length: size }, () => new Array(size).fill(false));

  // Timing patterns.
  for (let i = 0; i < size; i++) {
    mod[6][i] = i % 2 === 0 ? 1 : 0;
    mod[i][6] = i % 2 === 0 ? 1 : 0;
    func[6][i] = true;
    func[i][6] = true;
  }

  drawFinder(mod, func, size, 3, 3);
  drawFinder(mod, func, size, size - 4, 3);
  drawFinder(mod, func, size, 3, size - 4);

  const positions = ALIGNMENT_POS[version - 1];
  for (const cy of positions) {
    for (const cx of positions) {
      const nearFinder =
        (cx === 6 && cy === 6) ||
        (cx === 6 && cy === size - 7) ||
        (cx === size - 7 && cy === 6);
      if (!nearFinder) drawAlignment(mod, func, cx, cy);
    }
  }

  // Reserve the format areas (real bits are drawn after mask selection).
  drawFormat(mod, func, size, 0);

  // Zigzag data placement, skipping the vertical timing column.
  const codewords = buildCodewords(bytes, version);
  let bitIndex = 0;
  const totalBits = codewords.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!func[y][x] && bitIndex < totalBits) {
          mod[y][x] = (codewords[bitIndex >> 3] >>> (7 - (bitIndex & 7))) & 1;
          bitIndex++;
        }
      }
    }
  }

  // Pick the mask with the lowest penalty score.
  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mod, func, size, mask);
    drawFormat(mod, func, size, mask);
    const score = penalty(mod, size);
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
    }
    applyMask(mod, func, size, mask); // undo (XOR is its own inverse)
  }
  applyMask(mod, func, size, bestMask);
  drawFormat(mod, func, size, bestMask);

  return mod;
}

// ---------- Renderers ----------

/**
 * Render for a terminal using half-block characters, two matrix rows per
 * text line. Light modules are drawn bright so the code scans correctly
 * on dark terminal backgrounds.
 */
function toTerminal(matrix, indent = "  ") {
  const size = matrix.length;
  const quiet = 2;
  const span = size + quiet * 2;
  const isDark = (y, x) => {
    const my = y - quiet;
    const mx = x - quiet;
    if (my < 0 || my >= size || mx < 0 || mx >= size) return false;
    return matrix[my][mx] === 1;
  };

  const lines = [];
  for (let y = 0; y < span; y += 2) {
    let line = indent;
    for (let x = 0; x < span; x++) {
      const top = isDark(y, x);
      const bottom = y + 1 < span ? isDark(y + 1, x) : false;
      line += top ? (bottom ? " " : "▄") : bottom ? "▀" : "█";
    }
    lines.push(line);
  }
  return lines.join("\n");
}

/** Render as an SVG string (dark modules on white, 4-module quiet zone). */
function toSvg(matrix) {
  const size = matrix.length;
  const quiet = 4;
  const span = size + quiet * 2;
  let path = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${span} ${span}" ` +
    `shape-rendering="crispEdges" role="img" aria-label="QR code">` +
    `<rect width="${span}" height="${span}" fill="#ffffff"/>` +
    `<path d="${path}" fill="#000000"/></svg>`
  );
}

module.exports = { encode, toTerminal, toSvg };
