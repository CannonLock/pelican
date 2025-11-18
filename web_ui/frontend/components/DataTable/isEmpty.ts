const emptyValues = new Set([null, undefined, '', NaN]);

const isEmpty = (value: any) => {
  return emptyValues.has(value);
}

export default isEmpty;
