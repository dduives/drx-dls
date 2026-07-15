/**
 * Parse a Google Fonts stylesheet URL (DRI-108) into the font family name(s)
 * it requests. Accepts both the modern `css2` endpoint
 * (`.../css2?family=Inter:wght@400;700&family=Roboto`) and the legacy `css`
 * endpoint (`.../css?family=Open+Sans:400,700|Roboto`).
 *
 * Returns a discriminated result so callers can surface a clear inline error
 * on a bad or non-Google URL instead of silently swallowing it.
 */
export interface ParsedGoogleFont {
  /** Family names, in first-seen order, `+` decoded to spaces, de-duped. */
  families: string[];
}

export type ParseGoogleFontResult =
  | { ok: true; value: ParsedGoogleFont }
  | { ok: false; error: string };

export function parseGoogleFontUrl(input: string): ParseGoogleFontResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a Google Fonts URL." };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  if (url.hostname !== "fonts.googleapis.com") {
    return {
      ok: false,
      error: "URL must be a fonts.googleapis.com stylesheet link.",
    };
  }

  const familyParams = url.searchParams.getAll("family");
  if (familyParams.length === 0) {
    return {
      ok: false,
      error: "No font family found in the URL (missing a ?family= parameter).",
    };
  }

  const families: string[] = [];
  for (const param of familyParams) {
    // The legacy `css` endpoint allows several families in one param,
    // pipe-separated; each may carry a `:weights` spec (css) or `:axis@vals`
    // spec (css2) after a colon — strip it to get the family name.
    for (const part of param.split("|")) {
      const name = part.split(":")[0]?.replace(/\+/g, " ").trim();
      if (name) families.push(name);
    }
  }

  if (families.length === 0) {
    return {
      ok: false,
      error: "Couldn't read a font family name from the URL.",
    };
  }

  return { ok: true, value: { families: [...new Set(families)] } };
}
