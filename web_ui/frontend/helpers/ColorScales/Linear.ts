import chroma, { Color } from 'chroma-js';
import {green, blue} from '@mui/material/colors';

import { ColorScale } from './index';
import mixColors from './mixColors';

/**
 * Creates a linear color scale function for numbers.
 * @param startColor - The color for the minimum value (e.g., '#f00').
 * @param endColor - The color for the maximum value (e.g., '#0f0').
 * @returns A ColorScale<number> function.
 */
export function linearColorScale(
  startColor: string = blue[300],
  endColor: string = green[100],
): ColorScale<number> {
  return (item: number, items: number[]): string => {

    // If item is not a number, return a default color
    if (typeof item !== 'number' || isNaN(item)) {
      return chroma('white').hex();
    }

    const min = Math.min(...items);
    const max = Math.max(...items);
    // Avoid division by zero
    const t = max === min ? 0.5 : (item - min) / (max - min);
    return mixColors(chroma(startColor), chroma(endColor), t);
  };
}

export default linearColorScale;
