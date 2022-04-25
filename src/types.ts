export interface MinimalFileSystemNode {
  name: string;
  children?: MinimalFileSystemNode[];
}

export interface FileSystemNode {
  id: number;
  name: string;
  children?: FileSystemNode[];
}
