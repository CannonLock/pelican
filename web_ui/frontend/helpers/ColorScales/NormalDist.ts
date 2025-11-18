import chroma, { Color } from 'chroma-js';
import {green, blue} from '@mui/material/colors';

import { ColorScale } from './index';
import mixColors from '@/helpers/ColorScales/mixColors';

/**
 * Normal distribution color scale: emphasizes values near the mean.
 */
export function normalDistColorScale(
  startColor: string = blue[300],
  endColor: string = green[100],
  stddevFactor: number = 1
): ColorScale<number> {
  return (item: number, items: number[]): string => {

    // If item is not a number, return a default color
    if (typeof item !== 'number' || isNaN(item)) {
      return chroma('white').hex();
    }

    const n = items.length;
    if (n === 0) return chroma.mix(startColor, endColor, 0.5).hex();
    const mean = items.reduce((a, b) => a + b, 0) / n;
    const stddev = Math.sqrt(items.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n) || 1;
    // Normalized distance from mean
    const z = (item - mean) / (stddev * stddevFactor);
    // Map z to [0,1] using the normal distribution's PDF (bell curve)
    const t = Math.exp(-0.5 * z * z);
    // t is highest at mean, lowest at extremes; invert if you want color at extremes
    return mixColors(chroma(startColor), chroma(endColor), t);
  };
}

export default normalDistColorScale;
