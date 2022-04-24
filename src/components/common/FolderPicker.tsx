import { onMount } from 'solid-js';
import { compareNodesByNameButFolderFirst } from '../../utils/tree';
import { FileSystemNode } from '../../types';

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
    return FolderPickerOld(props);
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

async function readFolder(fileSystemDirectoryHandle: FileSystemDirectoryHandle): Promise<FileSystemNode> {
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
        name: entry.name,
      });
    }
  }

  await Promise.all(promises);

  children.sort(compareNodesByNameButFolderFirst);

  return {
    children: children,
    name: fileSystemDirectoryHandle.name,
  };
}

// TODO: Implement FolderPickerProps.onFolderPicked
export const FolderPickerOld = (_props: FolderPickerProps) => {
  let fileInput!: HTMLInputElement;

  onMount(() => {
    fileInput.webkitdirectory = true;
  });

  function show() {
    console.log('myInput', fileInput.files);
  }

  return (
    <div>
      <label for="avatar">Choose a folder:</label>
      <input type="file" ref={fileInput} multiple={true} />
      <button onClick={show}>Show</button>
    </div>
  );
};
