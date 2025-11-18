import chroma, { Color } from 'chroma-js';
import {green, blue} from '@mui/material/colors';

import { ColorScale } from './index';
import mixColors from '@/helpers/ColorScales/mixColors';

/**
 * Exponential color scale: emphasizes higher values.
 */
export function exponentialColorScale(
  startColor: string = blue[300],
  endColor: string = green[100],
  exponent: number = 2
): ColorScale<number> {
  return (item: number, items: number[]): string => {

    // If item is not a number, return a default color
    if (typeof item !== 'number' || isNaN(item)) {
      return chroma('white').hex();
    }

    const min = Math.min(...items);
    const max = Math.max(...items);
    let t = max === min ? 0.5 : (item - min) / (max - min);
    t = Math.pow(t, exponent);
    return mixColors(chroma(startColor), chroma(endColor), t);
  };
}

export default exponentialColorScale;
