import chroma, { Color } from 'chroma-js';
import {green, blue} from '@mui/material/colors';

import { ColorScale } from './index';
import mixColors from '@/helpers/ColorScales/mixColors';

/**
 * Logarithmic color scale: emphasizes lower values, useful for data spanning several orders of magnitude.
 * @param startColor - The color for the minimum value (e.g., '#f00').
 * @param endColor - The color for the maximum value (e.g., '#0f0').
 * @returns A ColorScale<number> function.
 */
export function logColorScale(
  startColor: string = blue[300],
  endColor: string = green[100],
): ColorScale<number> {
  return (item: number, items: number[]): string => {
    // Filter out non-positive values for log scale
    const positiveItems = items.filter((x) => typeof x === 'number' && x > 0);
    if (positiveItems.length === 0 || typeof item !== 'number' || item <= 0) {
      return chroma('white').hex();
    }
    const min = Math.min(...positiveItems);
    const max = Math.max(...positiveItems);
    if (min === max) return chroma('white').hex();
    const t = (Math.log(item) - Math.log(min)) / (Math.log(max) - Math.log(min));
    return mixColors(chroma(startColor), chroma(endColor), t);
  };
}
