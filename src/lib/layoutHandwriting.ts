import { Path, type Font, type Glyph, type PathCommand, type RenderOptions } from "opentype.js";

/**
 * Patrick Hand is an outline font, not a single-stroke calligraphy font.
 * Each glyph is split into real SVG contours: the letter body (with its
 * counters) and any separate Vietnamese diacritics. Scroll progress draws
 * those contours with stroke-dashoffset. This file is the only place that
 * turns text into path data, so a future centerline alphabet can replace it
 * without touching the pen or scroll engine.
 */

export type Stroke = {
  id: string;
  d: string;
  width: number;
  color: string;
};

export type HandwritingLayout = {
  width: number;
  height: number;
  fontSize: number;
  strokes: Stroke[];
  missing: string[];
};

const RENDER: RenderOptions = {
  kerning: true,
  letterSpacing: 0.03,
};

function hash(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function inkColor(seed: number) {
  const tone = hash(seed);
  const red = Math.round(107 - tone * 20);
  const green = Math.round(39 - tone * 8);
  const blue = Math.round(55 - tone * 6);
  return `rgb(${red} ${green} ${blue})`;
}

export function findMissingGlyphs(font: Font, text: string) {
  const missing = new Set<string>();
  for (const character of text) {
    if (character === " " || character === "\n" || character === "\t") continue;
    const glyph = font.charToGlyph(character);
    if (!glyph || glyph.index === 0 || glyph.name === ".notdef") {
      missing.add(character);
    }
  }
  return [...missing];
}

function commandsToPath(commands: PathCommand[]) {
  const path = new Path();
  for (const command of commands) {
    if (command.type === "M" && command.x != null && command.y != null) {
      path.moveTo(command.x, command.y);
    } else if (command.type === "L" && command.x != null && command.y != null) {
      path.lineTo(command.x, command.y);
    } else if (
      command.type === "Q" &&
      command.x1 != null &&
      command.y1 != null &&
      command.x != null &&
      command.y != null
    ) {
      path.quadTo(command.x1, command.y1, command.x, command.y);
    } else if (
      command.type === "C" &&
      command.x1 != null &&
      command.y1 != null &&
      command.x2 != null &&
      command.y2 != null &&
      command.x != null &&
      command.y != null
    ) {
      path.curveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y);
    } else if (command.type === "Z") {
      path.close();
    }
  }
  const last = commands[commands.length - 1];
  if (last && last.type !== "Z") path.close();
  return path;
}

function splitContours(glyphPath: Path) {
  const groups: PathCommand[][] = [];
  let current: PathCommand[] = [];
  for (const command of glyphPath.commands) {
    if (command.type === "M" && current.length > 0) {
      groups.push(current);
      current = [];
    }
    current.push(command);
  }
  if (current.length > 0) groups.push(current);
  return groups.map((commands) => commandsToPath(commands));
}

function pathData(path: Path) {
  const data = path.toPathData(1);
  if (!data) return "";
  return /[Zz]\s*$/.test(data) ? data : `${data}Z`;
}

function boxArea(box: { x1: number; y1: number; x2: number; y2: number }) {
  return Math.max(0, box.x2 - box.x1) * Math.max(0, box.y2 - box.y1);
}

function contourPaths(glyph: Glyph, x: number, y: number, fontSize: number) {
  const glyphPath = glyph.getPath(x, y, fontSize);
  if (glyphPath.commands.length === 0) return [];

  const contours = splitContours(glyphPath);
  const infos = contours.map((path) => {
    const box = path.getBoundingBox();
    return { path, box, area: boxArea(box) };
  });
  const usable = infos.filter((info) => info.area > 0.4);
  if (usable.length === 0) return [];

  let parentIndex = 0;
  usable.forEach((info, index) => {
    if (info.area > usable[parentIndex].area) parentIndex = index;
  });
  const parent = usable[parentIndex];
  const holes: typeof usable = [];
  const accents: typeof usable = [];

  usable.forEach((info, index) => {
    if (index === parentIndex) return;
    const centerX = (info.box.x1 + info.box.x2) / 2;
    const centerY = (info.box.y1 + info.box.y2) / 2;
    const inside =
      centerX >= parent.box.x1 &&
      centerX <= parent.box.x2 &&
      centerY >= parent.box.y1 &&
      centerY <= parent.box.y2 &&
      info.area < parent.area * 0.92;
    if (inside) holes.push(info);
    else accents.push(info);
  });

  const above = accents
    .filter((info) => (info.box.y1 + info.box.y2) / 2 < parent.box.y1)
    .sort((a, b) => b.box.y1 - a.box.y1);
  const below = accents
    .filter((info) => (info.box.y1 + info.box.y2) / 2 >= parent.box.y1)
    .sort((a, b) => a.box.y1 - b.box.y1);

  const base = [parent, ...holes]
    .map((info) => pathData(info.path))
    .filter(Boolean)
    .join(" ");
  const marks = [...above, ...below].map((info) => pathData(info.path)).filter(Boolean);
  return [base, ...marks].filter(Boolean);
}

function wrapLine(font: Font, line: string, fontSize: number, maxWidth: number) {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0] ?? "";
  for (let index = 1; index < words.length; index += 1) {
    const word = words[index] ?? "";
    const candidate = `${current} ${word}`;
    if (font.getAdvanceWidth(candidate, fontSize, RENDER) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

type ComposeResult = {
  strokes: Stroke[];
  bottom: number;
  overflow: boolean;
};

function compose(
  font: Font,
  message: string,
  signature: string,
  width: number,
  height: number,
  fontSize: number,
): ComposeResult {
  const strokes: Stroke[] = [];
  let overflow = false;
  let baseline = (font.ascender / font.unitsPerEm) * fontSize + 2;
  const descent = (Math.abs(font.descender) / font.unitsPerEm) * fontSize;
  const lineStep = ((font.ascender - font.descender) / font.unitsPerEm) * fontSize * 1.18;
  let serial = 1;
  let lineIndex = 0;
  let bottom = baseline;

  const placeLine = (text: string, align: "left" | "right") => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const lineWidth = font.getAdvanceWidth(trimmed, fontSize, RENDER);
    if (lineWidth > width + 1) overflow = true;
    const start = align === "right" ? Math.max(0, width - lineWidth) : 0;
    let charIndex = 0;
    font.forEachGlyph(trimmed, start, baseline, fontSize, RENDER, (glyph, glyphX, glyphY) => {
      const offsetX = (hash(serial) - 0.5) * fontSize * 0.028;
      const offsetY = (hash(serial + 19) - 0.5) * fontSize * 0.045;
      const parts = contourPaths(glyph, glyphX + offsetX, glyphY + offsetY, fontSize);
      parts.forEach((data, part) => {
        strokes.push({
          id: `l${lineIndex}-c${charIndex}-p${part}`,
          d: data,
          width: Number(((fontSize / 20) * (1.08 + hash(serial + part * 5) * 0.46)).toFixed(2)),
          color: inkColor(serial + part),
        });
      });
      charIndex += 1;
      serial += 1;
    });
    bottom = baseline + descent;
    baseline += lineStep * (0.985 + hash(lineIndex + 3) * 0.04);
    lineIndex += 1;
  };

  const paragraphs = message.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (paragraphIndex > 0) baseline += lineStep * 0.46;
    for (const hardLine of paragraph.split("\n")) {
      for (const line of wrapLine(font, hardLine, fontSize, width)) {
        placeLine(line, "left");
      }
    }
  });

  baseline += lineStep * 0.58;
  for (const hardLine of signature.replace(/\r\n/g, "\n").split("\n")) {
    for (const line of wrapLine(font, hardLine, fontSize, width)) {
      placeLine(line, "right");
    }
  }

  if (bottom > height - 1) overflow = true;
  return { strokes, bottom, overflow };
}

export function layoutLetter(
  font: Font,
  message: string,
  signature: string,
  width: number,
  height: number,
): HandwritingLayout {
  const missing = findMissingGlyphs(font, `${message}\n${signature}`);
  let fontSize = Math.min(29, Math.max(12, Math.min(width * 0.055, height / 21)));
  let laid = compose(font, message, signature, width, height, fontSize);
  while ((laid.overflow || laid.bottom > height - 1 || laid.strokes.length === 0) && fontSize > 8.5) {
    fontSize = Number((fontSize - 0.4).toFixed(2));
    laid = compose(font, message, signature, width, height, fontSize);
    if (laid.strokes.length > 0 && !laid.overflow && laid.bottom <= height - 1) break;
  }

  return {
    width,
    height,
    fontSize,
    strokes: laid.strokes,
    missing,
  };
}
