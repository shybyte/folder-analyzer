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

export interface Pos2D {
  x: number;
  y: number;
}

export type NumberRange = {
  start: number;
  end: number;
};
