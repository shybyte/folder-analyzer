import { FileSystemNode, MinimalFileSystemNode } from './types';
import { addIds, compareNodesByNameButFolderFirst } from './utils/tree';
import { verifyPermission } from './utils';

async function readFolderInternal(
  fileSystemDirectoryHandle: FileSystemDirectoryHandle,
): Promise<MinimalFileSystemNode> {
  const children = [];
  const promises = [];

  for await (const entry of fileSystemDirectoryHandle.values()) {
    if (entry.kind === 'directory') {
      promises.push(
        readFolder(entry).then((child) => {
          children.push(child);
        }),
      );
    } else {
      children.push({
        handle: entry,
        name: entry.name,
      });
    }
  }

  await Promise.all(promises);

  children.sort(compareNodesByNameButFolderFirst);

  return {
    children: children,
    handle: fileSystemDirectoryHandle,
    name: fileSystemDirectoryHandle.name,
  };
}

export async function readFolder(fileSystemDirectoryHandle: FileSystemDirectoryHandle): Promise<FileSystemNode> {
  const minimalTree = await readFolderInternal(fileSystemDirectoryHandle);
  return addIds(minimalTree);
}

export async function reReadFolder(rootFolderHandle: FileSystemDirectoryHandle): Promise<FileSystemNode> {
  await verifyPermission(rootFolderHandle);
  return readFolder(rootFolderHandle);
}
