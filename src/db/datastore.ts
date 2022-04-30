import { FileSystemNode } from '../types';
import { SimpleIndexDB } from '../utils/index-db';
import { convertTreeNodeToFb, readFlat, TreeNodeProxy } from './tree-fb/tree-node-fb-utils';

const ROOT_FOLDER_FB_DB_KEY = 'rootFolderFb';
const ROOT_FOLDER_HANDLE_DB_KEY = 'rootFolder'; // FileSystemDirectoryHandle

export interface StoredData {
  rootFolder: FileSystemNode;
  rootFolderHandle: FileSystemDirectoryHandle;
}

let simpleDB: SimpleIndexDB;

async function getSimpleDB() {
  if (!simpleDB) {
    simpleDB = await SimpleIndexDB.create('folder-analyzer');
  }
  return simpleDB;
}

export async function storeData(data: StoredData) {
  const db = await getSimpleDB();
  db.set(ROOT_FOLDER_FB_DB_KEY, convertTreeNodeToFb(data.rootFolder)).catch((error) => {
    console.error('Error while storing folder into IndexDB', error);
  });
  db.set(ROOT_FOLDER_HANDLE_DB_KEY, data.rootFolderHandle).catch((error) => {
    console.error('Error while storing folder into IndexDB', error);
  });
}

export async function readData(): Promise<StoredData | undefined> {
  const db = await getSimpleDB();

  const rootFolderHandle = await db.get<FileSystemDirectoryHandle>(ROOT_FOLDER_HANDLE_DB_KEY);
  if (!rootFolderHandle) {
    return undefined;
  }

  const rootFolderFbBuffer = await db.get<Uint8Array>(ROOT_FOLDER_FB_DB_KEY);
  if (!rootFolderFbBuffer) {
    return undefined;
  }

  return {
    rootFolder: new TreeNodeProxy(readFlat(rootFolderFbBuffer)),
    rootFolderHandle,
  };
}
