import { Component, Show } from 'solid-js';
import styles from './App.module.scss';
import { FileSystemNode, FolderPicker } from './components/common/FolderPicker';
import { createEffect, createResource, createSignal } from 'solid-js';
import { FolderNestedListView } from './components/FolderNestedListView';
import { SimpleIndexDB } from './utils/index-db';
import { countNodes } from './utils/tree';
import { PerformanceMetricDataPoint } from './utils/performance';

const ROOT_FOLDER_DB_KEY = 'rootFolder';

const App: Component = () => {
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
      console.time('loadDataFromIndexDB');
      const savedRootFolder = await db.get<FileSystemNode>(ROOT_FOLDER_DB_KEY);
      console.timeEnd('loadDataFromIndexDB');
      if (savedRootFolder) {
        console.log('savedRootFolder:', savedRootFolder);
        console.log('countNodes(savedRootFolder):', countNodes(savedRootFolder));

        const renderLayoutMetric = PerformanceMetricDataPoint.start('render-layout-app');
        const renderMetric = PerformanceMetricDataPoint.start('render-app');
        setRootFolder(savedRootFolder);
        renderMetric.end();

        const layoutMetric = PerformanceMetricDataPoint.start('layout-app');
        setTimeout(() => {
          layoutMetric.end();
          renderLayoutMetric.end();
        }, 0);
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
