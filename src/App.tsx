import { Component, createEffect, createSignal, Show } from 'solid-js';
import styles from './App.module.scss';
import { FolderPicker } from './components/common/FolderPicker';
import { FolderNestedListView } from './components/FolderNestedListView';
import { PerformanceMetricDataPoint, recordMetric, sendMetricIfConfigured } from './utils/performance';
import { FileSystemNode } from './types';
import { analyzeMetrics } from './metrics/analyze-metrics';
import { FILE_SIZE_METRIC, FileSizeMetricAnalyzer } from './metrics/file-size-metric-analyzer';
import { FolderMetricsAnalysis, MetricName } from './metrics/types';
import { verifyPermission } from './utils';
import { readData, storeData } from './db/datastore';
import { reReadFolder } from './read-folder';
import { aggregateMetrics } from './metrics/aggregrate';
import { FileCountMetricAnalyzer } from './metrics/file-count-metric-analyzer';
import { SimpleSelect } from './components/SimpleSelect';

const App: Component = () => {
  sendMetricIfConfigured('load-app', performance.now());
  recordMetric('prepare-data-loading');
  const [getRootFolderHandle, setRootFolderHandle] = createSignal<FileSystemDirectoryHandle>();
  const [getRootFolder, setRootFolder] = createSignal<FileSystemNode>();
  const [metricsAnalysis, setMetricsAnalysis] = createSignal<FolderMetricsAnalysis>({});
  const [getSelectedMetric, setSelectedMetric] = createSignal<MetricName>(FILE_SIZE_METRIC);

  const analyzers = [new FileSizeMetricAnalyzer(), new FileCountMetricAnalyzer()];

  async function onFolderPicked(folder: FileSystemNode) {
    console.log('folder', folder);
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
        rootFolder = await reReadFolder(getRootFolderHandle()!);
        setRootFolder(rootFolder);
      }
      const analyzeMetricsPerformance = PerformanceMetricDataPoint.start('analyzeMetrics');
      const analysis = await analyzeMetrics(analyzers, rootFolder);
      analyzeMetricsPerformance.end();
      console.log('analysis:', analysis);
      aggregateMetrics(rootFolder, analysis);
      setMetricsAnalysis(analysis);
      void storeData({
        rootFolder: rootFolder,
        rootFolderHandle: rootFolder.handle as FileSystemDirectoryHandle,
        rootFolderMetrics: analysis,
      });
    }
  }

  createEffect(async () => {
    recordMetric('load-data-from-index-db');
    const restoredData = await readData();
    if (restoredData) {
      recordMetric('render-app');
      setRootFolder(restoredData.rootFolder);
      setRootFolderHandle(restoredData.rootFolderHandle);
      setMetricsAnalysis(restoredData.rootFolderMetrics);
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
      <SimpleSelect
        setSelectedValue={setSelectedMetric}
        selectedValue={getSelectedMetric()}
        values={Object.keys(metricsAnalysis())}
      ></SimpleSelect>
      <Show when={getRootFolder()}>
        <FolderNestedListView
          root={getRootFolder()!}
          metrics={metricsAnalysis()}
          selectedMetric={getSelectedMetric()}
        />
      </Show>
    </div>
  );
};

export default App;
