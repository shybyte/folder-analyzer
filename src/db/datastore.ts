import { FileSystemNode } from '../types';
import { SimpleIndexDB } from '../utils/index-db';
import { convertTreeNodeToFb, readFlat, TreeNodeProxy } from './tree-fb/tree-node-fb-utils';
import { FolderMetricsAnalysis } from '../metrics/types';

const ROOT_FOLDER_FB_DB_KEY = 'rootFolderFb';
const ROOT_FOLDER_HANDLE_DB_KEY = 'rootFolder'; // FileSystemDirectoryHandle
const ROOT_FOLDER_METRICS_DB_KEY = 'rootFolderMetrics';

export interface StoredData {
  rootFolder: FileSystemNode;
  rootFolderHandle: FileSystemDirectoryHandle;
  rootFolderMetrics: FolderMetricsAnalysis;
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
    console.error('Error while storing folder handle into IndexDB', error);
  });
  db.set(ROOT_FOLDER_METRICS_DB_KEY, data.rootFolderMetrics).catch((error) => {
    console.error('Error while storing folder metrics into IndexDB', error);
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

  const rootFolderMetrics = await db.get<FolderMetricsAnalysis>(ROOT_FOLDER_METRICS_DB_KEY);
  if (!rootFolderMetrics) {
    return undefined;
  }

  return {
    rootFolder: new TreeNodeProxy(readFlat(rootFolderFbBuffer)),
    rootFolderHandle,
    rootFolderMetrics,
  };
}
