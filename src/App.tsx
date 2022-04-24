import { Component, createEffect, createResource, createSignal, Show } from 'solid-js';
import styles from './App.module.scss';
import { FolderPicker } from './components/common/FolderPicker';
import { FolderNestedListView } from './components/FolderNestedListView';
import { SimpleIndexDB } from './utils/index-db';
import { recordMetric, sendMetricIfConfigured } from './utils/performance';
import { convertTreeNodeToFb, readFlat, TreeNodeProxy } from './tree/tree-node-fb-utils';
import { FileSystemNode } from './types';

const ROOT_FOLDER_FB_DB_KEY = 'rootFolderFb';

const App: Component = () => {
  sendMetricIfConfigured('load-app', performance.now());
  recordMetric('prepare-data-loading');
  const [getDb] = createResource(async () => SimpleIndexDB.create('folder-analyzer'));
  const [rootFolder, setRootFolder] = createSignal<FileSystemNode>();

  function onFolderPicked(folder: FileSystemNode) {
    console.log('folder', folder);
    const db = getDb()!;
    db.set(ROOT_FOLDER_FB_DB_KEY, convertTreeNodeToFb(folder)).catch((error) => {
      console.error('Error while storing folder into IndexDB', error);
    });
    setRootFolder(folder);
  }

  document.body.addEventListener('compositionend', () => {
    console.log('compositionend');
  });

  function animLoop() {
    requestAnimationFrame(() => {
      animLoop();
    });
  }

  animLoop();

  createEffect(async () => {
    const db = getDb();
    if (db) {
      recordMetric('load-data-from-index-db');
      const savedRootFolderFbBuffer = await db.get<Uint8Array>(ROOT_FOLDER_FB_DB_KEY);
      if (savedRootFolderFbBuffer) {
        const treeNodeFb = readFlat(savedRootFolderFbBuffer);
        const savedRootFolder = new TreeNodeProxy(treeNodeFb);

        recordMetric('render-app');
        setRootFolder(savedRootFolder);

        recordMetric('layout-app');
        setTimeout(() => {
          recordMetric();
        }, 0);
      } else {
        recordMetric();
      }
    }
  });

  return (
    <div class={styles.app}>
      <b>Test</b>
      <FolderPicker onFolderPicked={onFolderPicked} />
      <Show when={rootFolder()}>
        <FolderNestedListView root={rootFolder()!} />
      </Show>
    </div>
  );
};

export default App;
