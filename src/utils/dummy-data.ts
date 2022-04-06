import { FileSystemNode } from '../components/common/FolderPicker';

export function createDummyFolderTree(name: string, childrenNumber: number, depth: number): FileSystemNode {
  if (depth === 0) {
    return { name };
  }
  const children: FileSystemNode[] = [];
  if (depth > 0) {
    for (let i = 0; i < childrenNumber; i++) {
      children.push(createDummyFolderTree('' + i, childrenNumber, depth - 1));
    }
  }
  return { name, children };
}
