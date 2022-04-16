import { Component, createEffect, createResource, createSignal, Show } from 'solid-js';
import styles from './App.module.scss';
import { FileSystemNode, FolderPicker } from './components/common/FolderPicker';
import { FolderNestedListView } from './components/FolderNestedListView';
import { SimpleIndexDB } from './utils/index-db';
import { countNodes } from './utils/tree';
import { recordMetric, sendMetricIfConfigured } from './utils/performance';

const ROOT_FOLDER_DB_KEY = 'rootFolder';

const App: Component = () => {
  sendMetricIfConfigured('load-app', performance.now());
  recordMetric('prepare-data-loading');
  const [getDb] = createResource(async () => SimpleIndexDB.create('folder-analyzer'));
  const [rootFolder, setRootFolder] = createSignal<FileSystemNode>();

  function onFolderPicked(folder: FileSystemNode) {
    console.log('folder', folder);
    getDb()!
      .set(ROOT_FOLDER_DB_KEY, folder)
      .catch((error) => {
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
      const savedRootFolder = await db.get<FileSystemNode>(ROOT_FOLDER_DB_KEY);
      if (savedRootFolder) {
        console.log('savedRootFolder:', savedRootFolder);
        recordMetric('count-nodes');
        console.log('countNodes(savedRootFolder):', countNodes(savedRootFolder));

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
