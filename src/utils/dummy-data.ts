import { FileSystemNode } from '../components/common/FolderPicker';

export function createDummyFolderTree(name: string, childrenNumber: number, depth: number): FileSystemNode {
  if (depth === 0) {
    return { name };
  }
  const children: FileSystemNode[] = [];
  if (depth > 0) {
    for (let i = 0; i < childrenNumber; i++) {
      children.push(createDummyFolderTree(createRandomName2(10) + i, childrenNumber, depth - 1));
    }
  }
  return { name, children };
}

function createRandomName() {
  return Math.random().toString(36).slice(2, 7);
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function createRandomName2(length: number) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
