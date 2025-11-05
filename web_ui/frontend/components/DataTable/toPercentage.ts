const toPercentage  = (value: number, fractionDigits: number = 2): string => {
  return (value * 100).toFixed(fractionDigits) + '%';
}

export default toPercentage;
