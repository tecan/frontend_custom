/**
 * Shared risk matrix lookup utility.
 */
import { contrastTextColor } from './colorUtils';

export const RISK_MATRIX_TABLE = {
  VIRTUALLY_IMPOSSIBLE: {
    LOW: { rating: 'very_low', action: 'accept', color: '#4CAF50' },
    MEDIUM: { rating: 'very_low', action: 'accept', color: '#4CAF50' },
    HIGH: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    CRITICAL: { rating: 'low', action: 'monitor', color: '#8BC34A' },
  },
  UNLIKELY: {
    LOW: { rating: 'very_low', action: 'accept', color: '#4CAF50' },
    MEDIUM: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    HIGH: { rating: 'medium', action: 'monitor_plan', color: '#FF9800' },
    CRITICAL: { rating: 'high', action: 'mitigate', color: '#f44336' },
  },
  POSSIBLE: {
    LOW: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    MEDIUM: { rating: 'medium', action: 'monitor_plan', color: '#FF9800' },
    HIGH: { rating: 'high', action: 'mitigate', color: '#f44336' },
    CRITICAL: { rating: 'critical', action: 'mitigate_immediately', color: '#D32F2F' },
  },
  LIKELY: {
    LOW: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    MEDIUM: { rating: 'high', action: 'mitigate', color: '#f44336' },
    HIGH: { rating: 'high', action: 'mitigate', color: '#f44336' },
    CRITICAL: { rating: 'critical', action: 'mitigate_immediately', color: '#D32F2F' },
  },
  ALMOST_CERTAIN: {
    LOW: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    MEDIUM: { rating: 'high', action: 'mitigate', color: '#f44336' },
    HIGH: { rating: 'critical', action: 'mitigate_immediately', color: '#D32F2F' },
    CRITICAL: { rating: 'critical', action: 'mitigate_immediately', color: '#D32F2F' },
  },
};

/**
 * Look up a risk matrix entry for a given likelihood + impact combination.
 * Uses the custom admin-configured matrix when enabled, falls back to RISK_MATRIX_TABLE.
 *
 * @param {string} likelihood
 * @param {string} impact
 * @param {object|null} customMatrix - loaded via $customization.preloadRiskMatrixConfig()
 * @param {Function|null} t          - Vue $t() translation function
 * @returns {{ rating, action, color, textColor, ratingText, actionText }|null}
 */
export function lookupRiskEntry(likelihood, impact, customMatrix, t) {
  if (!likelihood || !impact) return null;

  if (customMatrix && customMatrix.enabled) {
    const cellKey = likelihood + '::' + impact;
    const cell = customMatrix.cells[cellKey];
    if (cell) {
      const level = customMatrix.levels.find((l) => l.key === cell.levelKey);
      if (level) {
        return {
          rating: level.key,
          action: cell.action,
          color: level.color,
          textColor: contrastTextColor(level.color),
          ratingText: level.label,
          actionText: cell.action,
        };
      }
    }
    return null;
  }

  const likelihoodRow = RISK_MATRIX_TABLE[likelihood];
  if (!likelihoodRow) return null;
  const entry = likelihoodRow[impact];
  if (!entry) return null;
  return {
    ...entry,
    textColor: contrastTextColor(entry.color),
    ratingText: t ? t(`riskMatrix.ratings.${entry.rating}`) : entry.rating,
    actionText: t ? t(`riskMatrix.actions.${entry.action}`) : entry.action,
  };
}
