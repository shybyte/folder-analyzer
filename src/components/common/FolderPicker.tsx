import { FileSystemNode } from '../../types';
import { readFolder } from '../../read-folder';

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
