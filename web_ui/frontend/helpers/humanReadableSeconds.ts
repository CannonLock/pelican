// Converts seconds to a human-readable string with the closest time unit
export function humanReadableSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(2)} s`;
  } else if (seconds < 3600) {
    return `${(seconds / 60).toFixed(2)} min`;
  } else if (seconds < 86400) {
    return `${(seconds / 3600).toFixed(2)} hr`;
  } else {
    return `${(seconds / 86400).toFixed(2)} days`;
  }
}

export default humanReadableSeconds;
