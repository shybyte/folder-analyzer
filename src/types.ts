export type FileNodeID = number;

export interface MinimalFileSystemNode {
  name: string;
  handle?: FileSystemDirectoryHandle | FileSystemFileHandle;
  children?: MinimalFileSystemNode[];
}

export interface FileSystemNode {
  id: number;
  name: string;
  handle?: FileSystemDirectoryHandle | FileSystemFileHandle;
  children?: FileSystemNode[];
}

export interface FileSystemNodeWithFileHandle {
  id: number;
  name: string;
  handle: FileSystemFileHandle;
}
