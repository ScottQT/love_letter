declare module "opentype.js" {
  export type PathCommand = {
    type: string;
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  };

  export class Path {
    commands: PathCommand[];
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;
    quadTo(x1: number, y1: number, x: number, y: number): void;
    close(): void;
    getBoundingBox(): { x1: number; y1: number; x2: number; y2: number };
    toPathData(decimalPlaces?: number): string;
  }

  export class Glyph {
    index: number;
    name: string;
    unicode?: number;
    advanceWidth: number;
    getPath(x: number, y: number, fontSize: number): Path;
  }

  export type RenderOptions = {
    kerning?: boolean;
    letterSpacing?: number;
  };

  export class Font {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    charToGlyph(character: string): Glyph;
    getAdvanceWidth(text: string, fontSize: number, options?: RenderOptions): number;
    forEachGlyph(
      text: string,
      x: number,
      y: number,
      fontSize: number,
      options: RenderOptions,
      callback: (glyph: Glyph, x: number, y: number, fontSize: number) => void,
    ): number;
  }

  export function parse(buffer: ArrayBuffer): Font;
}
