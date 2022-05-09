export function sortByCompare<T>(array: readonly T[], compare: (a: T, b: T) => number): T[] {
  return [...array].sort(compare);
}

export function sum<T>(array: T[], getter: (el: T) => number) {
  return array.reduce((acc, value) => acc + getter(value), 0);
}

export function max<T>(array: T[], getter: (el: T) => number): number {
  return array.reduce((acc, value) => Math.max(acc, getter(value)), 0);
}
