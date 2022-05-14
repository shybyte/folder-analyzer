import { NumberRange } from '../types';

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

type PermissionStatus = 'granted' | 'denied' | 'prompt';

declare global {
  interface FileSystemDirectoryHandle {
    queryPermission(): Promise<PermissionStatus>;
    requestPermission(): Promise<PermissionStatus>;
  }

  interface FileSystemFileHandle {
    queryPermission(): Promise<PermissionStatus>;
    requestPermission(): Promise<PermissionStatus>;
  }
}

// https://web.dev/file-system-access/
// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission
export async function verifyPermission(fileHandle: FileSystemDirectoryHandle | FileSystemFileHandle) {
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission()) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  return (await fileHandle.requestPermission()) === 'granted';
}

export function isInRange(value: number, range: NumberRange) {
  return range.start <= value && value <= range.end;
}

export function calculateAngle(x: number, y: number): number {
  const angleRadRaw = Math.atan2(y, x);
  return angleRadRaw > 0 ? angleRadRaw : Math.PI * 2 + angleRadRaw;
}

export function middle(x: number, y: number) {
  return (x + y) / 2;
}
