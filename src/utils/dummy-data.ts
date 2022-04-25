import { FileSystemNode } from '../types';
import { Counter } from './index';

export function createDummyFolderTree(
  name: string,
  childrenNumber: number,
  depth: number,
  idCounter: Counter,
): FileSystemNode {
  const id = idCounter.getAndInc();
  if (depth === 0) {
    return { id, name };
  }
  const children: FileSystemNode[] = [];
  if (depth > 0) {
    for (let i = 0; i < childrenNumber; i++) {
      children.push(createDummyFolderTree(createRandomString(10), childrenNumber, depth - 1, idCounter));
    }
  }
  return { id, name, children };
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function createRandomString(length: number) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
