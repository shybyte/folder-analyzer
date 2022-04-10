import { Component, Show } from 'solid-js';
import styles from './App.module.css';
import { FileSystemNode, FolderPicker } from './components/common/FolderPicker';
import { createEffect, createResource, createSignal } from 'solid-js';
import { FolderNestedListView } from './components/FolderNestedListView';
import { SimpleIndexDB } from './utils/index-db';
import { countNodes } from './utils/tree';

const ROOT_FOLDER_DB_KEY = 'rootFolder';

const App: Component = () => {
  const [getDb] = createResource(async () => SimpleIndexDB.create('folder-analyzer'));
  const [rootFolder, setRootFolder] = createSignal<FileSystemNode>();

  function onFolderPicked(folder: FileSystemNode) {
    console.log('folder', folder);
    getDb()!.set(ROOT_FOLDER_DB_KEY, folder);
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
        console.time('renderJSX');
        setRootFolder(savedRootFolder);
        console.timeEnd('renderJSX');
        console.time('layout1');
        setTimeout(() => {
          console.timeEnd('layout1');
        }, 0);
      }
    }
  });

  return (
    <div class={styles.App}>
      <FolderPicker onFolderPicked={onFolderPicked} />
      <Show when={rootFolder()}>
        <FolderNestedListView root={rootFolder()!} />
      </Show>
    </div>
  );
};

export default App;
