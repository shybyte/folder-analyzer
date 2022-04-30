import { Component, createEffect, createSignal, Show } from 'solid-js';
import styles from './App.module.scss';
import { FolderPicker, readFolder } from './components/common/FolderPicker';
import { FolderNestedListView } from './components/FolderNestedListView';
import { PerformanceMetricDataPoint, recordMetric, sendMetricIfConfigured } from './utils/performance';
import { FileSystemNode } from './types';
import { analyzeMetrics } from './metrics/analyze-metrics';
import { FileSizeMetricAnalyzer } from './metrics/file-size-metric-analyzer';
import { FolderMetricsAnalysis } from './metrics/types';
import { verifyPermission } from './utils';
import { readData, storeData } from './db/datastore';

const App: Component = () => {
  sendMetricIfConfigured('load-app', performance.now());
  recordMetric('prepare-data-loading');
  const [getRootFolderHandle, setRootFolderHandle] = createSignal<FileSystemDirectoryHandle>();
  const [getRootFolder, setRootFolder] = createSignal<FileSystemNode>();
  const [metricsAnalysis, setMetricsAnalysis] = createSignal<FolderMetricsAnalysis>({});

  const analyzers = [new FileSizeMetricAnalyzer()];

  async function onFolderPicked(folder: FileSystemNode) {
    console.log('folder', folder);
    void storeData({ rootFolder: folder, rootFolderHandle: folder.handle as FileSystemDirectoryHandle });
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
    recordMetric('load-data-from-index-db');
    const restoredData = await readData();
    if (restoredData) {
      recordMetric('render-app');
      setRootFolder(restoredData.rootFolder);
      setRootFolderHandle(restoredData.rootFolderHandle);
      recordMetric('layout-app');
      setTimeout(() => {
        recordMetric();
      }, 0);
    } else {
      recordMetric();
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
