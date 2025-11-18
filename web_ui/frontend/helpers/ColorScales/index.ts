import { Color } from 'chroma-js';

export type ColorScale<T> = (item: T, items: T[]) => string;

// Export all color scales from their own files
export * from './Linear';
export * from './Exponential';
export * from './NormalDist';
export * from './Log';
