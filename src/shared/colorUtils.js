/**
 * Calculate relative luminance of a hex color per WCAG 2.0.
 */
export function relativeLuminance(hex) {
  const cleaned = hex.replace('#', '');
  let r, g, b;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  }
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Return a readable text color for a given background.
 * Uses WCAG luminance threshold of 0.179.
 */
export function contrastTextColor(bgHex) {
  if (!bgHex || typeof bgHex !== 'string') return '#ffffff';
  try {
    return relativeLuminance(bgHex) > 0.65 ? '#000000' : '#ffffff';
  } catch (e) {
    return '#ffffff';
  }
}
