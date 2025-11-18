import {Color} from 'chroma-js';

export const mixColors = (startColor: Color, endColor: Color, t: number) => {
  if(t < .5){
    return startColor.tint(t * 2).hex();
  } else {
    return endColor.tint(1 - (t * 2)).hex();
  }
}

export default mixColors;
