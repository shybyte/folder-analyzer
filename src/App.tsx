import {onMount} from 'solid-js';
import type { Component } from 'solid-js';
import styles from './App.module.css';
import {FileSystemNode, FolderPicker} from './components/common/FolderPicker';

const App: Component = () => {
  function onFolderPicked(folder: FileSystemNode) {
    console.log('folder', folder);
  }

  return (
    <div class={styles.App}>
      <FolderPicker onFolderPicked={onFolderPicked}></FolderPicker>
    </div>
  );
};

export default App;
