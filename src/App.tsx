import { Component, createEffect, createResource, createSignal, Show } from 'solid-js';
import styles from './App.module.scss';
import { FolderPicker, readFolder } from './components/common/FolderPicker';
import { FolderNestedListView } from './components/FolderNestedListView';
import { SimpleIndexDB } from './utils/index-db';
import { PerformanceMetricDataPoint, recordMetric, sendMetricIfConfigured } from './utils/performance';
import { convertTreeNodeToFb, readFlat, TreeNodeProxy } from './tree/tree-node-fb-utils';
import { FileSystemNode } from './types';
import { analyzeMetrics } from './metrics/analyze-metrics';
import { FileSizeMetricAnalyzer } from './metrics/file-size-metric-analyzer';
import { FolderMetricsAnalysis } from './metrics/types';
import { verifyPermission } from './utils';

const ROOT_FOLDER_FB_DB_KEY = 'rootFolderFb';
const ROOT_FOLDER_HANDLE_DB_KEY = 'rootFolder'; // FileSystemDirectoryHandle

const App: Component = () => {
  sendMetricIfConfigured('load-app', performance.now());
  recordMetric('prepare-data-loading');
  const [getDb] = createResource(async () => SimpleIndexDB.create('folder-analyzer'));
  const [getRootFolderHandle, setRootFolderHandle] = createSignal<FileSystemDirectoryHandle>();
  const [getRootFolder, setRootFolder] = createSignal<FileSystemNode>();
  const [metricsAnalysis, setMetricsAnalysis] = createSignal<FolderMetricsAnalysis>({});

  const analyzers = [new FileSizeMetricAnalyzer()];

  async function onFolderPicked(folder: FileSystemNode) {
    console.log('folder', folder);
    const db = getDb()!;
    db.set(ROOT_FOLDER_FB_DB_KEY, convertTreeNodeToFb(folder)).catch((error) => {
      console.error('Error while storing folder into IndexDB', error);
    });
    db.set(ROOT_FOLDER_HANDLE_DB_KEY, folder.handle).catch((error) => {
      console.error('Error while storing folder into IndexDB', error);
    });
    setRootFolderHandle(folder.handle as FileSystemDirectoryHandle);
    setRootFolder(folder);
    await analyze();
  }

  async function analyze() {
    let rootFolder = getRootFolder();
    if (rootFolder) {
      if (rootFolder.handle) {
        await verifyPermission(rootFolder.handle);
      } else if (getRootFolderHandle()) {
        const rootFolderHandle = getRootFolderHandle()!;
        await verifyPermission(rootFolderHandle);
        rootFolder = await readFolder(rootFolderHandle);
        setRootFolder(rootFolder);
      }
      const analyzeMetricsPerformance = PerformanceMetricDataPoint.start('analyzeMetrics');
      const analysis = await analyzeMetrics(analyzers, rootFolder);
      analyzeMetricsPerformance.end();
      console.log('analysis:', analysis);
      setMetricsAnalysis(analysis);
    }
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

      const savedRootFolderHandle = await db.get<FileSystemDirectoryHandle>(ROOT_FOLDER_HANDLE_DB_KEY);
      if (savedRootFolderHandle) {
        setRootFolderHandle(savedRootFolderHandle);
      }

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
      <FolderPicker
        onFolderPicked={(folder) => {
          void onFolderPicked(folder);
        }}
      />
      <button
        onClick={() => {
          void analyze();
        }}
        disabled={!getRootFolder()}
      >
        Analyze
      </button>
      <Show when={getRootFolder()}>
        <FolderNestedListView root={getRootFolder()!} metrics={metricsAnalysis()} />
      </Show>
    </div>
  );
};

export default App;
