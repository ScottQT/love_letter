import { parse, type Font } from "opentype.js";
import patrickUrl from "../assets/fonts/PatrickHand-Regular.ttf?url";

let pending: Promise<Font> | null = null;
let cached: Font | null = null;

export function getCachedHandwritingFont() {
  return cached;
}

export function loadHandwritingFont() {
  if (!pending) {
    pending = fetch(patrickUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load the handwriting font");
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        cached = parse(buffer);
        return cached;
      })
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}
