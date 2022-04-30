import { addIds, compareNodesByNameButFolderFirst } from '../../utils/tree';
import { FileSystemNode, MinimalFileSystemNode } from '../../types';

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/wicg-file-system-access/index.d.ts
declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory';
    getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
    removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
    resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
    keys(): AsyncIterableIterator<string>;
    values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
    entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;
    [Symbol.asyncIterator]: FileSystemDirectoryHandle['entries'];
    readonly isFile: false;
  }
}

interface FolderPickerProps {
  onFolderPicked(folder: FileSystemNode): void;
}

export const FolderPicker = (props: FolderPickerProps) => {
  if (!window.showDirectoryPicker) {
    return <div>Your Browser is currently not supported. Please use a Chromium based browser for now. </div>;
  } else {
    return FolderPickerNew(props);
  }
};

export const FolderPickerNew = (props: FolderPickerProps) => {
  async function show() {
    const dirHandle = await window.showDirectoryPicker();
    console.time('readFolder');
    const tree = await readFolder(dirHandle);
    console.timeEnd('readFolder');
    props.onFolderPicked(tree);
  }

  return (
    <div>
      <button
        onClick={() => {
          show().catch((error) => {
            console.error('Error while reading folder', error);
          });
        }}
      >
        Select Folder
      </button>
    </div>
  );
};

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
