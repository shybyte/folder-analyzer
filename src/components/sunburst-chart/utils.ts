export function sum<T>(array: T[], getValue: (el: T) => number): number {
  return array.reduce((acc, v) => acc + getValue(v), 0);
}

export function random(max = 1) {
  return Math.random() * max;
}
