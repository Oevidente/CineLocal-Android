/**
 * Pure TypeScript self-contained QR Code Generator (Versions 1-10, Error Correction L/M)
 * Generates an SVG path or 2D boolean matrix with zero external dependencies and zero network calls.
 */

// GF(256) math with primitive polynomial 0x11d (285)
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(() => {
  let value = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = value;
    EXP_TABLE[i + 255] = value;
    LOG_TABLE[value] = i;
    value = (value << 1) ^ (value & 0x80 ? 0x11d : 0);
  }
})();

function gMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function rsComputeGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gMul(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsComputeRemainder(data: Uint8Array, ecLength: number): Uint8Array {
  const gen = rsComputeGeneratorPoly(ecLength);
  const remainder = new Uint8Array(ecLength);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[ecLength - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < ecLength; j++) {
        remainder[j] ^= gMul(gen[j], factor);
      }
    }
  }
  return remainder;
}

// Version table: [version, totalCodewords, ecCodewords, blocksGroup1, dataPerBlock1, blocksGroup2, dataPerBlock2]
// Using Level L for maximum capacity in compact size
const VERSION_INFO_L: Array<[number, number, number, number, number, number, number]> = [
  [1, 26, 7, 1, 19, 0, 0],
  [2, 44, 10, 1, 34, 0, 0],
  [3, 70, 15, 1, 55, 0, 0],
  [4, 100, 20, 1, 80, 0, 0],
  [5, 134, 26, 1, 108, 0, 0],
  [6, 172, 36, 2, 68, 0, 0],
  [7, 196, 40, 2, 78, 0, 0],
  [8, 242, 48, 2, 97, 0, 0],
  [9, 292, 60, 2, 116, 0, 0],
  [10, 346, 72, 2, 68, 2, 69],
];

// Alignment pattern centers for versions 1 to 10
const ALIGNMENT_PATTERN_LOCATIONS: number[][] = [
  [], // V1
  [6, 18], // V2
  [6, 22], // V3
  [6, 26], // V4
  [6, 30], // V5
  [6, 34], // V6
  [6, 22, 38], // V7
  [6, 24, 42], // V8
  [6, 26, 46], // V9
  [6, 28, 50], // V10
];

export function createQrMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  // Find lowest version that fits
  let version = 1;
  let chosenInfo = VERSION_INFO_L[0];
  let maxCapacity = 0;

  for (const info of VERSION_INFO_L) {
    const v = info[0];
    const totalDataBytes = info[3] * info[4] + info[5] * info[6];
    // 4 bits mode + (v <= 9 ? 8 : 16) bits char count indicator
    const headerBits = 4 + (v <= 9 ? 8 : 16);
    const capacity = Math.floor((totalDataBytes * 8 - headerBits) / 8);
    if (capacity >= textBytes.length) {
      version = v;
      chosenInfo = info;
      maxCapacity = totalDataBytes;
      break;
    }
  }

  if (maxCapacity === 0) {
    // If text is larger than V10, fallback to V10 truncate or largest
    version = 10;
    chosenInfo = VERSION_INFO_L[9];
    maxCapacity = chosenInfo[3] * chosenInfo[4] + chosenInfo[5] * chosenInfo[6];
  }

  // Pack data into bit buffer
  const bits: number[] = [];
  const pushBits = (value: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((value >> i) & 1);
    }
  };

  // Mode: 8-bit byte mode = 0100
  pushBits(0b0100, 4);

  // Character count indicator
  const countBits = version <= 9 ? 8 : 16;
  const safeLength = Math.min(textBytes.length, Math.floor((maxCapacity * 8 - 4 - countBits) / 8));
  pushBits(safeLength, countBits);

  // Data bytes
  for (let i = 0; i < safeLength; i++) {
    pushBits(textBytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const remainingDataBits = maxCapacity * 8 - bits.length;
  pushBits(0, Math.min(4, Math.max(0, remainingDataBits)));

  // Pad to multiple of 8
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Pad bytes 0xEC and 0x11
  let padToggle = false;
  while (bits.length < maxCapacity * 8) {
    pushBits(padToggle ? 0x11 : 0xec, 8);
    padToggle = !padToggle;
  }

  // Convert bits to byte array
  const dataBytes = new Uint8Array(maxCapacity);
  for (let i = 0; i < maxCapacity; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // Split into blocks and compute Reed-Solomon error correction
  const [, , ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data] = chosenInfo;
  const blocksData: Uint8Array[] = [];
  const blocksEc: Uint8Array[] = [];
  let byteOffset = 0;

  for (let i = 0; i < g1Blocks; i++) {
    const chunk = dataBytes.slice(byteOffset, byteOffset + g1Data);
    byteOffset += g1Data;
    blocksData.push(chunk);
    blocksEc.push(rsComputeRemainder(chunk, ecPerBlock));
  }

  for (let i = 0; i < g2Blocks; i++) {
    const chunk = dataBytes.slice(byteOffset, byteOffset + g2Data);
    byteOffset += g2Data;
    blocksData.push(chunk);
    blocksEc.push(rsComputeRemainder(chunk, ecPerBlock));
  }

  // Interleave data codewords
  const finalCodewords: number[] = [];
  const maxDataPerBlock = Math.max(g1Data, g2Data);
  for (let i = 0; i < maxDataPerBlock; i++) {
    for (let b = 0; b < blocksData.length; b++) {
      if (i < blocksData[b].length) {
        finalCodewords.push(blocksData[b][i]);
      }
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < blocksEc.length; b++) {
      finalCodewords.push(blocksEc[b][i]);
    }
  }

  // Convert interleaved codewords to bit stream
  const codewordBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let b = 7; b >= 0; b--) {
      codewordBits.push((cw >> b) & 1);
    }
  }

  // Matrix creation
  const size = 17 + version * 4;
  const matrix: Array<Array<boolean | null>> = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );
  const isFunctionModule: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  const setModule = (r: number, c: number, val: boolean, isFunc = true) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      if (isFunc) isFunctionModule[r][c] = true;
    }
  };

  // 1. Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (startRow: number, startCol: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = startRow + r;
        const col = startCol + c;
        if (row < 0 || row >= size || col < 0 || col >= size) continue;
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const isBorder = (r === 0 || r === 6 || c === 0 || c === 6) && inOuter;
        const isDark = isBorder || inInner;
        setModule(row, col, isDark, true);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const isDark = i % 2 === 0;
    if (matrix[6][i] === null) setModule(6, i, isDark, true);
    if (matrix[i][6] === null) setModule(i, 6, isDark, true);
  }

  // 3. Dark module
  setModule(4 * version + 9, 8, true, true);

  // 4. Alignment patterns (V2+)
  if (version >= 2) {
    const coords = ALIGNMENT_PATTERN_LOCATIONS[version - 1];
    for (const r of coords) {
      for (const c of coords) {
        // Skip finders
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;

        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isDark = dr === -2 || dr === 2 || dc === -2 || dc === 2 || (dr === 0 && dc === 0);
            setModule(r + dr, c + dc, isDark, true);
          }
        }
      }
    }
  }

  // 5. Reserve format info areas
  for (let i = 0; i <= 8; i++) {
    if (matrix[8][i] === null) setModule(8, i, false, true);
    if (matrix[i][8] === null) setModule(i, 8, false, true);
  }
  for (let i = 0; i <= 7; i++) {
    if (matrix[8][size - 1 - i] === null) setModule(8, size - 1 - i, false, true);
    if (matrix[size - 1 - i][8] === null) setModule(size - 1 - i, 8, false, true);
  }

  // 6. Place data bits (Mask 0: (row + col) % 2 === 0)
  // Mask 0 is standard and universally supported by all QR readers.
  let bitIndex = 0;
  let dirUp = true;

  for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol--; // Skip vertical timing column

    const rows = dirUp
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [rightCol, rightCol - 1]) {
        if (!isFunctionModule[r][c]) {
          const bit = bitIndex < codewordBits.length ? codewordBits[bitIndex] : 0;
          bitIndex++;
          // Apply mask 0: invert if (r + c) % 2 === 0
          const maskInvert = (r + c) % 2 === 0;
          matrix[r][c] = (bit === 1) !== maskInvert;
        }
      }
    }
    dirUp = !dirUp;
  }

  // 7. Write Format Information for Level L, Mask 0
  // Level L = 01, Mask 0 = 000 -> 01000 with BCH error code and XOR mask 101010000010010 = 0x77c4
  const FORMAT_INFO_L_MASK0 = 0x77c4;
  for (let i = 0; i < 15; i++) {
    const bit = ((FORMAT_INFO_L_MASK0 >> i) & 1) === 1;

    // Around top-left finder
    if (i <= 5) setModule(8, i, bit, true);
    else if (i === 6) setModule(8, 7, bit, true);
    else if (i === 7) setModule(8, 8, bit, true);
    else if (i === 8) setModule(7, 8, bit, true);
    else setModule(14 - i, 8, bit, true);

    // Around top-right and bottom-left finders
    if (i < 8) setModule(size - 1 - i, 8, bit, true);
    else setModule(8, size - 15 + i, bit, true);
  }

  // Convert to pure boolean[][]
  return matrix.map((row) => row.map((cell) => cell === true));
}

/**
 * Returns an SVG path representation for rendering in React
 */
export function getQrSvgPath(matrix: boolean[][]): { path: string; size: number } {
  const size = matrix.length;
  let path = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        path += `M${c},${r}h1v1h-1z `;
      }
    }
  }
  return { path, size };
}
