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
