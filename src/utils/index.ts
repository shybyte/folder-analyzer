export class Counter {
  #count: number;

  constructor() {
    this.#count = 0;
  }

  get count(): number {
    return this.#count;
  }

  inc() {
    this.#count += 1;
  }

  getAndInc(): number {
    return this.#count++;
  }
}

export function omit<T, K extends keyof T>(object: T, key: K): Omit<T, K> {
  const shallowClone = { ...object };
  delete shallowClone[key];
  return shallowClone;
}
