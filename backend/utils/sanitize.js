// backend/utils/sanitize.js

/**
 * Sanitizes user-supplied text before interpolating into AI prompts or storing in DB.
 * Removes control characters, neutralizes prompt-injection boundary attempts,
 * and normalizes whitespace.
 *
 * @param {string} rawInput
 * @returns {string}
 */
export function sanitizeUserInput(rawInput) {
  if (typeof rawInput !== 'string') {
    return '';
  }

  return rawInput
    // Strip ASCII control characters except standard newlines (\n, \r) and tabs (\t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Neutralize common prompt injection override phrases
    .replace(/ignore\s+(all\s+)?(previous|prior|above)\s+instructions/gi, '[filtered]')
    .replace(/system\s*prompt\s*:/gi, '[filtered]:')
    // Escape triple backticks so user content cannot break markdown/JSON blocks
    .replace(/```/g, "'''")
    .trim();
}

/**
 * Extracts valid JSON object text from a raw Gemini response string,
 * handling markdown code fences if present.
 *
 * @param {string} rawText
 * @returns {string}
 */
export function extractJsonString(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response received from Gemini AI.');
  }

  const trimmed = rawText.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch && fencedMatch[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

